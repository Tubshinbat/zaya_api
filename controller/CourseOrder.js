const CourseOrder = require("../models/CourseOrder");
const User = require("../models/User");
const MyError = require("../utils/myError");
const asyncHandler = require("express-async-handler");
const paginate = require("../utils/paginate");

const { valueRequired } = require("../lib/check");

exports.createCourseOrder = asyncHandler(async (req, res) => {
  req.body.status = req.body.status || false;
  req.body.createUser = req.userId;
  const user = req.body.user || req.userId;
  req.body.user = user;

  let d = new Date();
  const orderCount = await CourseOrder.find({}).count();
  let year = d.getFullYear();
  let month = d.getMonth();
  year = year.toString().substr(-2);
  month = (month + 1).toString();
  if (month.length === 1) {
    month = "0" + month;
  }

  req.body.orderNumber = `C${year}${month}0${Math.floor(Math.random() * 10)}${
    orderCount + 1
  }`;

  if (req.body.pay) {
    if (req.body.pay === "true") {
      const user = await User.findById(req.body.user);
      if (req.body.courseIs === "onlineCourse") {
        user.onlineCourse.push(req.body.onlineCourse);
        user.save();
      }

      if (req.body.courseIs === "course") {
        user.course.push(req.body.course);
        user.save();
      }
    }
  }

  const courseOrder = await CourseOrder.create(req.body);

  res.status(200).json({
    success: true,
    data: courseOrder,
  });
});

exports.getCourseOrders = asyncHandler(async (req, res) => {
  // Эхлээд query - уудаа аваад хоосон үгүйг шалгаад утга олгох
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  let sort = req.query.sort || { createAt: -1 };

  const courseIs = req.query.courseIs || null;
  const ordernumber = req.query.ordernumber || null;
  const payis = req.query.payis || null;
  const courseName = req.query.courseName || null;
  const orderType = req.query.orderType || null;
  const user = req.query.user || null;

  if (sort)
    if (typeof sort === "string") {
      sort = JSON.parse("{" + req.query.sort + "}");
    }

  ["select", "sort", "page", "limit", "status", "name"].forEach(
    (el) => delete req.query[el]
  );

  const query = CourseOrder.find({});

  if (valueRequired(courseIs)) {
    query.where("courseIs").equals(courseIs);
  }

  if (valueRequired(payis)) query.where("pay").equals(payis);

  if (valueRequired(courseName)) {
    if (courseIs === "course") query.where("course").equals(courseName);
    else query.where("onlineCourse").equals(courseName);
  }

  if (valueRequired(ordernumber))
    query.find({
      orderNumber: { $regex: ".*" + ordernumber + ".*", $options: "i" },
    });

  if (valueRequired(user)) {
    query.where("user").equals(user);
  }

  if (valueRequired(orderType)) {
    query.where("orderType").equals(orderType);
  }

  query
    .populate("createUser")
    .populate("user")
    .populate("orderType")
    .populate("onlineCourse")
    .populate("course");

  query.sort(sort);

  const qc = query.toConstructor();
  const clonedQuery = new qc();
  const result = await clonedQuery.count();

  const pagination = await paginate(page, limit, null, result);
  query.skip(pagination.start - 1);
  query.limit(limit);

  const courseOrder = await query.exec();

  res.status(200).json({
    success: true,
    count: courseOrder.length,
    data: courseOrder,
    pagination,
  });
});

exports.getCourseOrder = asyncHandler(async (req, res, next) => {
  const courseOrder = await CourseOrder.findById(req.params.id)
    .populate("createUser")
    .populate("orderType")
    .populate("course")
    .populate("user")
    .populate("onlineCourse");

  if (!courseOrder) {
    throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);
  }

  res.status(200).json({
    success: true,
    data: courseOrder,
  });
});

exports.deleteCourseOrder = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const deleteCourseOrder = await CourseOrder.findByIdAndDelete(id);

  if (!deleteCourseOrder) throw new MyError("Тухайн мэдээлэл олдсонгүй. ", 404);

  res.status(200).json({
    success: true,
    data: deleteCourseOrder,
  });
});

exports.multDeleteCourseOrder = asyncHandler(async (req, res, next) => {
  const ids = req.queryPolluted.id;
  const findCourseOrders = await CourseOrder.find({ _id: { $in: ids } });

  if (findCourseOrders.length <= 0) {
    throw new MyError("Таны сонгосон контентууд олдсонгүй", 400);
  }

  const courseOrder = await CourseOrder.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    data: courseOrder,
  });
});

exports.updateCourseOrder = asyncHandler(async (req, res, next) => {
  let courseOrder = await CourseOrder.findById(req.params.id).populate("user");
  req.body.updateUser = req.userId;

  delete req.body.createUser;
  if (!courseOrder)
    throw new MyError("Таны хайсан сургалтын бүртгэл олдсонгүй.", 404);

  if (valueRequired(req.body.pay)) {
    if (req.body.pay === true) {
      if (courseOrder.user && courseOrder.user.course) {
        const course = {
          course: [...courseOrder.user.course, courseOrder.course],
        };
        const user = await User.findByIdAndUpdate(courseOrder.user._id, course);
      }
      if (courseOrder.user && courseOrder.user.onlineCourse) {
        const onlineCourse = {
          onlineCourse: [
            ...courseOrder.user.onlineCourse,
            courseOrder.onlineCourse,
          ],
        };
        const user = await User.findByIdAndUpdate(
          courseOrder.user._id,
          onlineCourse
        );
      }
    } else {
      if (courseOrder.user && courseOrder.user.course) {
        const index = courseOrder.user.course.indexOf(courseOrder.course);
        if (index > -1) {
          courseOrder.user.course.splice(index, 1);
          const data = {
            course: courseOrder.user.course,
          };
          const user = await User.findByIdAndUpdate(courseOrder.user._id, data);
        }
      }
      if (courseOrder.user && courseOrder.user.onlineCourse) {
        const index = courseOrder.user.onlineCourse.indexOf(courseOrder.course);
        if (index > -1) {
          courseOrder.user.onlineCourse.splice(index, 1);
          const data = {
            onlineCourse: courseOrder.user.onlineCourse,
          };
          const user = await User.findByIdAndUpdate(courseOrder.user._id, data);
        }
      }
    }
  }

  courseOrder = await CourseOrder.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: courseOrder,
  });
});

exports.getCounCourseOrder = asyncHandler(async (req, res, next) => {
  const courseOrder = await CourseOrder.count();
  res.status(200).json({
    success: true,
    data: courseOrder,
  });
});
