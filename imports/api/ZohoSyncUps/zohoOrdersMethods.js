import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import moment from 'moment';
import 'moment-timezone';
import rateLimit from '../../modules/rate-limit';
import Products from '../Products/Products';
import Orders from '../Orders/Orders';
import constants from '../../modules/constants';
import zh from './ZohoInventory';
import { syncUpConstants } from './ZohoSyncUps';
import { updateSyncAndReturn, retResponse } from './zohoCommon';


// TODO May have to be a seperate table
const _productTypeToZohoGroupIdMap = {
  Vegetables: '702207000000066009',
  Groceries: '702207000000066019',
  Batter: '702207000000066029',
};

const _getZohoGroupId = type => _productTypeToZohoGroupIdMap[type];


// SalesOrder status - sent, draft, overdue, paid, void, unpaid, partially_paid and viewed
// Sales order status - draft, confirmed, SalesOrderd, closed, void, on hold
const _orderStatusToZohoSalesOrderStatus = {
  Pending: { zh_status: 'confirmed' },
  Awaiting_Payment: { zh_status: 'open' },
  Awaiting_Fulfillment: { zh_status: 'open' },
  Completed: { zh_status: 'fulfilled' },
  Cancelled: { zh_status: 'void' },
  Shipped: { zh_status: 'fulfilled' },
};

const _getZohoSalesOrderStatus = status => _orderStatusToZohoSalesOrderStatus[status].zh_status;

const _getZhDisplayDate = (dateObject) => {
  // const dateObject = new Date(dateString)
  const zhDateSettings = {
    format: 'YYYY-MM-DD',
    timeZone: 'Asia/Kolkata',
  };
  return moment(dateObject).tz(zhDateSettings.timeZone).format(zhDateSettings.format);
};

const _getZohoUserIdFromUserId = userId =>
  // mongo collections have only meteor ids
   Meteor.users.findOne({ _id: userId }, { zh_contact_id: 1 }).zh_contact_id || '';

const _getZohoItemIdFromProductId = productId =>
  Products.findOne({ _id: productId }, { zh_item_id: 1 }).zh_item_id || '';

const _createZohoSalesOrder = (order) => {
  const zhSalesOrder = {
    date: _getZhDisplayDate(order.createdAt), // "2013-11-17"
    status: _getZohoSalesOrderStatus(order.order_status), // possible values -
    customer_id: _getZohoUserIdFromUserId(order.customer_details._id), // mandatory
    notes: order.comments || '',
  };

  const lineItems = [];
  order.products.forEach((product) => {
    lineItems.push({
      item_id: product.zh_item_id || _getZohoItemIdFromProductId(product._id), // mandatory
      name: product.name,
      description: product.description || '',
      rate: product.unitprice,
      quantity: product.quantity,
      unit: product.unitOfSale,
    });
  });

  zhSalesOrder.line_items = lineItems;
  return zhSalesOrder;
};


const _syncOrdersWithZoho = (pendOrd, successResp, errorResp) => {
  const order = pendOrd;
  const zhSalesOrder = _createZohoSalesOrder(order);
  const r = (order.zh_salesorder_id) ?
          zh.updateRecord('salesorders', order.zh_salesorder_id, zhSalesOrder) :
          zh.createRecord('salesorders', zhSalesOrder);

  if (r.code === 0 /* Success */) {
    Orders.update({ _id: order._id }, { $set: {
      zh_salesorder_id: r.salesorder.salesorder_id,
      order_status: constants.OrderStatus.Awaiting_Fulfillment.name,
    } });
    successResp.push(retResponse(r));
  } else {
    errorResp.push(retResponse(r));
  }
};

export const syncBulkOrdersWithZoho = new ValidatedMethod({
  name: 'orders.syncBulkOrdersWithZoho',
  validate() {},
  run() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(401, 'Access denied');
    }
    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const query = { order_status: constants.OrderStatus.Pending.name };

      const orders = Orders.find(query).fetch(); // change to get products updated after sync date

      orders.forEach((ord) => {
        _syncOrdersWithZoho(ord, successResp, errorResp);
      });
    }
    return updateSyncAndReturn('orders', successResp, errorResp, nowDate, syncUpConstants.ordersToZoho);
  },
});

const _areAllItemsInvoiced = (zhSalesOrder) => {
  const lineItems = zhSalesOrder.line_items;
  return lineItems.reduce((startValue, item) => startValue && item.is_invoiced, true);
};

const _syncOrderFromZoho = (awaitOrd, successResp, errorResp) => {
  const order = awaitOrd;
  const r = zh.getRecordById('salesorders', order.zh_salesorder_id);
  if (r.code === 0 /* Success */) {
    // From invoices update status
    const zhSalesOrder = r.salesorder;
    if (zhSalesOrder.status === 'confirmed') {
      let orderStatus = constants.OrderStatus.Partially_Completed.name;
      if (_areAllItemsInvoiced(zhSalesOrder)) {
        orderStatus = constants.OrderStatus.Completed.name;
      }
      Orders.update({ _id: order._id }, { $set: { order_status: orderStatus } });
    }
    successResp.push(retResponse(r));
  } else {
    errorResp.push(retResponse(r));
  }
};

export const updateOrdersFromZoho = new ValidatedMethod({
  name: 'orders.updateOrdersFromZoho',
  validate() {},
  run() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(401, 'Access denied');
    }
    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const query = { $or: [
               { order_status: constants.OrderStatus.Awaiting_Fulfillment.name },
               { order_status: constants.OrderStatus.Partially_Completed.name },
      ] };
      const orders = Orders.find(query).fetch();
      orders.forEach((ord) => {
        _syncOrderFromZoho(ord, successResp, errorResp);
      });
    }
    return updateSyncAndReturn('orders', successResp, errorResp, nowDate, syncUpConstants.ordersFromZoho);
  },
});


rateLimit({
  methods: [updateOrdersFromZoho, syncBulkOrdersWithZoho],
  limit: 5,
  timeRange: 1000,
});
