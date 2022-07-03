const Content = require("../models/Content");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { multImages, fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createContent = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;
  const files = req.files;
  let fileNames;

  if (!files) {
    throw new MyError("Зураг хуулж оруулна уу", 400);
  }

  const content = await Content.create(req.body);

  if (files.pictures.length > 1)
    fileNames = await multImages(files, Date.now());
  else {
    fileNames = await fileUpload(files.pictures, Date.now());
    fileNames = [fileNames.fileName];
  }

  content.pictures = fileNames;
  content.save();

  res.status(200).json({
    success: true,
    data: content,
  });
});

exports.getContents = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  let status = req.query.status || null;
  const name = req.query.name || null;
  const categories = req.query.categories || null;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = Content.find();

  if (valueRequired(name))
    query.find({
      name: { $regex: ".*" + name + ".*", $options: "i" },
    });
  if (valueRequired(categories)) query.where("categories").in(categories);
  if (valueRequired(status)) query.where("status").equals(status);

  query.populate("createUser").populate("categories");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const content = await query.exec();

  res.status(200).json({
    success: true,
    count: content.length,
    data: content,
    pagination,
  });
});

exports.getContent = asyncHandler(async (req, res, next) => {
  const content = await Content.findById(req.params.id)
    .populate("createUser")
    .populate("categories");

  if (!content) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: content,
  });
});

exports.deleteContent = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteContent = await Content.findByIdAndDelete(id);

  if (!deleteContent) throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);

  await imageDelete(deleteContent.pictures);

  res.status(200).json({
    success: true,
    data: deleteContent,
  });
});

exports.multDeleteContent = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findContents = await Content.find({ _id: { $in: ids } });

  if (findContents.length <= 0) {
    throw new MyError("Таны сонгосон контентууд олдсонгүй", 400);
  }

  findContents.map(async (el) => {
    await imageDelete(el.pictures);
  });

  const content = await Content.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: content,
  });
});

exports.updateContent = asyncHandler(async (req, res, next) => {
  let content = await Content.findById(req.params.id);
  const files = req.files;
  let fileNames = [];
  let oldPictures = req.body.oldPicture;

  if (!content) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  if (!req.body.oldPicture && !files) {
    throw new MyError("Та зураг upload хийнэ үү", 400);
  }

  if (files) {
    if (files.pictures) {
      if (files.pictures.length >= 2) {
        fileNames = await multImages(files, "content");
      } else {
        fileNames = await fileUpload(files.pictures, "content");
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

  req.body.updateUser = req.userId;
  content = await Content.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: content,
  });
});

exports.getCounContent = asyncHandler(async (req, res, next) => {
  const content = await Content.count();
  res.status(200).json({
    success: true,
    data: content,
  });
});
