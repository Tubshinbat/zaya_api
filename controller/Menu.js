const Menu = require("../models/Menu");
const Page = require("../models/Page");
const asyncHandler = require("express-async-handler");
const MyError = require("../utils/myError");

exports.createMenu = asyncHandler(async (req, res, next) => {
  const isModel = req.body.isModel || false;
  const isDirect = req.body.isDirect || false;

  if (isModel === false) {
    delete req.body.isModel;
    delete req.body.model;
  }
  if (isDirect === false) {
    delete req.body.isDirect;
    delete req.body.direct;
  }

  delete req.body.picture;

  const category = await Menu.create(req.body);

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.menuCount = asyncHandler(async (req, res, next) => {
  const mCount = await Menu.count();
  res.status(200).json({
    success: true,
    data: mCount,
  });
});

function createCategories(categories, parentId = null) {
  const categoryList = [];
  let category = null;
  if (parentId === null) {
    category = categories.filter((cat) => cat.parentId == undefined);
  } else {
    category = categories.filter((cat) => cat.parentId == parentId);
  }
  createPosition(category);
  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      isDirect: cate.isDirect,
      direct: cate.direct,
      model: cate.model,
      picture: cate.picture || null,
      position: cate.position,
      children: createCategories(categories, cate._id),
    });
  }
  return categoryList.reverse();
}

const createPosition = (categories) => {
  categories.map(async (cat, index) => {
    let sort = index + 1;
    if (cat.position === undefined) {
      sort = parseInt(sort);
      await Menu.findByIdAndUpdate(cat._id, { position: sort });
    }
  });
};

exports.upDownMenus = asyncHandler(async (req, res) => {
  const menu = await Menu.findById(req.body.id);
  const newPosition = req.body.position;
  const oldPosition = req.body.oldPosition;
  if (!menu) throw new MyError(req.params.id + " Тус цэс олдсонгүй.", 404);
  if (menu.parentId !== undefined) {
    const result = await Menu.findOneAndUpdate({}, { position: oldPosition })
      .where("parentId")
      .in(menu.parentId)
      .where("position")
      .equals(newPosition);
  } else {
    const result = await Menu.findOneAndUpdate({}, { position: oldPosition })
      .where("position")
      .equals(newPosition)
      .where("parentId")
      .equals(null);
  }
  menu.position = newPosition;
  menu.save();

  res.status(200).json({
    success: true,
    data: menu,
  });
});

exports.getMenus = asyncHandler(async (req, res, next) => {
  Menu.find({})
    .sort({ position: -1 })
    .exec((error, categories) => {
      if (error)
        return res.status(400).json({
          success: false,
          error,
        });
      if (categories) {
        const categoryList = createCategories(categories);
        res.status(200).json({
          success: true,
          data: categoryList,
        });
      }
    });
});

exports.getMenu = asyncHandler(async (req, res, next) => {
  const menu = await Menu.findById(req.params.id);

  if (!menu) {
    throw new MyError(req.params.id + " Тус  ангилал олдсонгүй.", 404);
  }

  res.status(200).json({
    success: true,
    data: menu,
  });
});

exports.deletetMenu = asyncHandler(async (req, res, next) => {
  const category = await Menu.findById(req.params.id);
  if (!category) {
    throw new MyError(req.params.id + " ангилал олдсонгүй", 404);
  }

  category.remove();

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.updateMenu = asyncHandler(async (req, res, next) => {
  const isModel = req.body.isModel || false;
  const isDirect = req.body.isDirect || false;

  if (isModel === false) {
    delete req.body.isModel;
    delete req.body.model;
  }
  if (isDirect === false) {
    delete req.body.isDirect;
    delete req.body.direct;
  }

  const category = await Menu.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new MyError("Ангилалын нэр солигдсонгүй", 400);
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

exports.getSlugMenu = asyncHandler(async (req, res) => {
  const slug = req.params.slug;

  const slugArray = slug.split(",");
  const mainParent = slugArray[0];
  let firstParent = null;
  let leadParent = null;
  let childeMenus = null;
  let menu = null;
  let sameParentMenus = [];

  firstParent = await Menu.findOne({ slug: mainParent })
    .where("parentId")
    .equals(undefined);
  menu = firstParent;

  leadParent = firstParent;

  childeMenus = await Menu.find({}).where("parentId").in(firstParent._id);

  if (slugArray.length === 2) {
    leadParent = firstParent;
    menu = await Menu.findOne({ slug: slugArray[slugArray.length - 1] })
      .where("parentId")
      .equals(leadParent._id);
    childeMenus = await Menu.find({}).where("parentId").equals(menu._id);
  }

  if (slugArray.length === 3) {
    leadParent = await Menu.findOne({ slug: slugArray[slugArray.length - 2] })
      .where("parentId")
      .equals(firstParent._id);

    menu = await Menu.findOne({ slug: slugArray[slugArray.length - 1] })
      .where("parentId")
      .equals(leadParent._id);
    childeMenus = await Menu.find({}).where("parentId").equals(menu._id);
  } else if (slugArray.length > 3) {
    leadParent = await Menu.findOne({ slug: slugArray[slugArray.length - 2] });
    menu = await Menu.findOne({ slug: slugArray[slugArray.length - 1] })
      .where("parentId")
      .equals(leadParent._id);
    childeMenus = await Menu.find({}).where("parentId").equals(menu._id);
  }

  if (childeMenus) {
    if (childeMenus.length <= 0) {
      sameParentMenus = await Menu.find({})
        .where("parentId")
        .equals(leadParent._id);
    }
  }

  res.status(200).json({
    success: true,
    data: menu,
    parent: leadParent,
    childeMenus: childeMenus,
    sameParentMenus: sameParentMenus,
  });
});
