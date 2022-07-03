const Course = require("../models/Course");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");
const { multImages, fileUpload, imageDelete } = require("../lib/photoUpload");
const { valueRequired } = require("../lib/check");

exports.createCourse = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;

  let d = new Date();
  const orderCount = await Course.find({}).count();
  let year = d.getFullYear();
  let month = d.getMonth();
  year = year.toString().substr(-2);
  month = (month + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }

  req.body.courseNumber = `C${year}${month}${orderCount + 1}`;

  const files = req.files;
  let fileNames;

  if (!files) {
    throw new MyError("Зураг хуулж оруулна уу", 400);
  }

  const course = await Course.create(req.body);

  if (files.pictures.length > 1)
    fileNames = await multImages(files, Date.now());
  else {
    fileNames = await fileUpload(files.pictures, Date.now());
    fileNames = [fileNames.fileName];
  }

  course.pictures = fileNames;
  course.save();

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.getCourses = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };
  let status = req.query.status || null;
  const name = req.query.name || null;
  const number = req.query.number || null;
  const teacher = req.query.teacher || null;
  const categories = req.query.categories || null;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = Course.find();

  if (valueRequired(name))
    query.find({
      name: { $regex: ".*" + name + ".*", $options: "i" },
    });
  if (valueRequired(categories)) query.where("categories").in(categories);
  if (valueRequired(status)) query.where("status").equals(status);
  if (valueRequired(teacher)) query.where("teacher").equals(teacher);

  query.populate("createUser").populate("categories").populate("teacher");
  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const course = await query.exec();

  res.status(200).json({
    success: true,
    count: course.length,
    data: course,
    pagination,
  });
});

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate("createUser")
    .populate("categories")
    .populate("teacher");

  if (!course) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteCourse = await Course.findByIdAndDelete(id);

  if (!deleteCourse) throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);

  await imageDelete(deleteCourse.pictures);

  res.status(200).json({
    success: true,
    data: deleteCourse,
  });
});

exports.multDeleteCourse = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findCourses = await Course.find({ _id: { $in: ids } });

  if (findCourses.length <= 0) {
    throw new MyError("Таны сонгосон контентууд олдсонгүй", 400);
  }

  findCourses.map(async (el) => {
    await imageDelete(el.pictures);
  });

  const course = await Course.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  const files = req.files;
  let fileNames = [];
  let oldPictures = req.body.oldPicture;
  delete req.body.createUser;

  if (!course) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  if (!req.body.oldPicture && !files) {
    throw new MyError("Та зураг upload хийнэ үү", 400);
  }

  if (files) {
    if (files.pictures) {
      if (files.pictures.length >= 2) {
        fileNames = await multImages(files, "course");
      } else {
        fileNames = await fileUpload(files.pictures, "course");
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
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

exports.getCounCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.count();
  res.status(200).json({
    success: true,
    data: course,
  });
});
