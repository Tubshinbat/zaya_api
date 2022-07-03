const Service = require("../models/Service");
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

exports.createService = asyncHandler(async (req, res) => {
  req.body.createUser = req.userId;
  req.body.price = parseInt(req.body.price);
  let fileNames;

  let d = new Date();
  const orderCount = await Service.find({}).count();
  let year = d.getFullYear();
  let month = d.getMonth();
  year = year.toString().substr(-2);
  month = (month + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }

  console.log(req.body);

  req.body.serviceNumber = `P${year}${month}${orderCount + 1}`;

  const files = req.files;

  if (!files || !files.pictures) throw new MyError("Зураг оруулна уу");

  if (files.pictures.length > 1) {
    fileNames = await multImages(files, Date.now());
  } else {
    fileNames = await fileUpload(files.pictures, Date.now());
    fileNames = [fileNames.fileName];
  }

  req.body.pictures = fileNames;

  const service = await Service.create(req.body);

  res.status(200).json({
    success: true,
    data: Service,
  });
});

exports.getServices = asyncHandler(async (req, res) => {
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

  const query = Service.find();

  if (valueRequired(name))
    query.find({
      name: { $regex: ".*" + name + ".*", $options: "i" },
    });

  if (valueRequired(number)) {
    query.find({
      serviceNumber: { $regex: ".*" + number + ".*", $options: "i" },
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

  const service = await query.exec();

  res.status(200).json({
    success: true,
    count: service.length,
    data: service,
    pagination,
  });
});

exports.getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate("createUser");

  if (!service) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: service,
  });
});

exports.deleteService = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteService = await Service.findByIdAndDelete(id);
  if (!deleteService) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  deleteService.pictures.map(async (el) => {
    await imageDelete(el.pictures);
  });

  res.status(200).json({
    success: true,
    data: deleteService,
  });
});

exports.multDeleteService = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findServices = await Service.find({ _id: { $in: ids } });

  if (findServices.length <= 0) {
    throw new MyError("Таны сонгосон сургалтууд олдсонгүй", 400);
  }

  findServices.map((el) => {
    el.pictures.map(async (el) => {
      await imageDelete(el.pictures);
    });
  });

  const service = await Service.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: service,
  });
});

exports.updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);
  let fileNames = [];
  req.body.updateUser = req.userId;
  delete req.body.createUser;
  let oldPictures = req.body.oldPicture;

  if (!service) {
    throw new MyError("Тухайн сургалт олдсонгүй", 404);
  }

  const files = req.files;

  if (!oldPictures && !files) {
    throw new MyError("Та сургалтын зургаа оруулна уу", 400);
  }

  if (files) {
    if (files.pictures) {
      if (files.pictures.length >= 2) {
        fileNames = await multImages(files, "service");
      } else {
        fileNames = await fileUpload(files.pictures, "service");
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

  service = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: service,
  });
});

exports.getCountService = asyncHandler(async (req, res, next) => {
  const service = await Service.count();
  res.status(200).json({
    success: true,
    data: service,
  });
});
