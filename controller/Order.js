const Order = require("../models/Order");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
// const fs = require("fs");
const paginate = require("../utils/paginate");
const { multImages, fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createOrder = asyncHandler(async (req, res, next) => {
  req.body.totalPrice = parseInt(req.body.totalPrice);
  req.body.createUser = req.userId;

  let d = new Date();
  const orderCount = await Order.find({}).count();
  let year = d.getFullYear();
  let month = d.getMonth();
  year = year.toString().substr(-2);
  month = (month + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }

  req.body.orderNumber = `O${year}${month}0${Math.floor(Math.random() * 10)}${
    orderCount + 1
  }`;

  const order = await Order.create(req.body);

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.getOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const select = req.query.select;

  const orderNumber = req.query.ordernumber || null;
  const orderType = req.query.orderType || null;
  const product = req.query.product || null;
  const user = req.query.user || null;
  const pay = req.query.payis || null;

  [("select", "sort", "page", "limit", "status", "name")].forEach(
    (el) => delete req.query[el]
  );

  const query = Order.find();
  if (valueRequired(orderNumber))
    query.find({
      orderNumber: { $regex: ".*" + orderNumber + ".*", $options: "i" },
    });

  if (valueRequired(orderType)) query.where("orderType").equals(orderType);
  if (valueRequired(pay)) query.where("pay").equals(pay);
  if (valueRequired(user)) query.where("user").equals(user);
  if (valueRequired(product)) query.where("product").equals("product");

  query.populate("orderType").populate("product").populate("user");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, Order, result);
  query.limit(limit);
  query.skip(pagination.start - 1);
  const order = await query.exec();

  res.status(200).json({
    success: true,
    count: order.length,
    data: order,
    pagination,
  });
});

exports.multDeleteOrder = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findOrder = await Order.find({ _id: { $in: ids } });

  if (findOrder.length <= 0) {
    throw new MyError("Таны сонгосон захилгууд олдсонгүй", 400);
  }

  const order = await Order.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
  });
});

exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("product")
    .populate("orderType")
    .populate("user");

  if (!order) {
    throw new MyError("Тухайн захиалга олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.updateOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);
  const files = req.files;
  let fileNames = [];

  if (!order) {
    throw new MyError("Тухайн захиалга олдсонгүй. ", 404);
  }

  req.body.updateUser = req.userId;

  order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: order,
  });
});

exports.getCountOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.count();
  res.status(200).json({
    success: true,
    data: order,
  });
});
