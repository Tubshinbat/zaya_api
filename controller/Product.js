const Product = require("../models/Product");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const {
  multImages,
  fileUpload,
  imageDelete,
  videoUpload,
} = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createProduct = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  req.body.price = parseInt(req.body.price);
  let fileNames;

  let d = new Date();
  const orderCount = await Product.find({}).count();
  let year = d.getFullYear();
  let month = d.getMonth();
  year = year.toString().substr(-2);
  month = (month + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }

  req.body.productNumber = `P${year}${month}${orderCount + 1}`;

  const files = req.files;

  if (!files || !files.pictures) throw new MyError("Зураг оруулна уу");

  if (files.pictures.length > 1) {
    fileNames = await multImages(files, Date.now());
  } else {
    fileNames = await fileUpload(files.pictures, Date.now());
    fileNames = [fileNames.fileName];
  }

  req.body.pictures = fileNames;

  const product = await Product.create(req.body);

  res.status(200).json({
    success: true,
    data: Product,
  });
});

exports.getProducts = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  const name = req.query.name || null;
  const number = req.query.number || null;
  const status = req.query.status || null;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = Product.find();

  if (valueRequired(name))
    query.find({
      name: { $regex: ".*" + name + ".*", $options: "i" },
    });

  if (valueRequired(number)) {
    query.find({
      productNumber: { $regex: ".*" + number + ".*", $options: "i" },
    });
  }

  if (valueRequired(status)) query.where("status").equals(status);

  query.populate("createUser");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const product = await query.exec();

  res.status(200).json({
    success: true,
    count: product.length,
    data: product,
    pagination,
  });
});

exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate("createUser");

  if (!product) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteProduct = await Product.findByIdAndDelete(id);
  if (!deleteProduct) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  deleteProduct.pictures.map(async (el) => {
    await imageDelete(el.pictures);
  });

  res.status(200).json({
    success: true,
    data: deleteProduct,
  });
});

exports.multDeleteProduct = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findProducts = await Product.find({ _id: { $in: ids } });

  if (findProducts.length <= 0) {
    throw new MyError("Таны сонгосон сургалтууд олдсонгүй", 400);
  }

  findProducts.map((el) => {
    el.pictures.map(async (el) => {
      await imageDelete(el.pictures);
    });
  });

  const product = await Product.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  let fileNames;
  req.body.updateUser = req.userId;
  let oldPictures = req.body.oldPictures;

  if (!product) {
    throw new MyError("Тухайн сургалт олдсонгүй", 404);
  }

  const files = req.files;

  if (!oldPictures && !files) {
    throw new MyError("Та сургалтын зургаа оруулна уу", 400);
  }

  if (files) {
    if (files.pictures) {
      if (files.pictures.length >= 2) {
        fileNames = await multImages(files, "news");
      } else {
        fileNames = await fileUpload(files.pictures, "news");
        fileNames = [fileNames.fileName];
      }
    }
  }

  if (oldPictures) {
    typeof oldPictures != "string"
      ? (req.body.pictures = [...oldPictures, ...fileNames])
      : (req.body.pictures = [oldPictures, ...fileNames]);
  } else {
    req.body.pictures = fileNames;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
  });
});

exports.getCounProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.count();
  res.status(200).json({
    success: true,
    data: product,
  });
});
