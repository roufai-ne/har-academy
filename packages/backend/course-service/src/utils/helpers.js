const slugify = str =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const generateUniqueSlug = async (model, title, existingId = null) => {
  let slug = slugify(title);
  let uniqueSlug = slug;
  let counter = 1;

  while (true) {
    const query = { slug: uniqueSlug };
    if (existingId) {
      query._id = { $ne: existingId };
    }

    const exists = await model.findOne(query);
    if (!exists) break;

    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

const paginateResults = async (model, query, page = 1, limit = 10, populate = [], sort = {}) => {
  const skip = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    model
      .find(query)
      .populate(populate)
      .sort(sort)
      .skip(skip)
      .limit(limit),
    model.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    results,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

const formatError = (error) => {
  if (error.name === 'ValidationError') {
    const errors = {};
    for (let field in error.errors) {
      errors[field] = error.errors[field].message;
    }
    return {
      type: 'ValidationError',
      errors
    };
  }

  if (error.name === 'MongoError' && error.code === 11000) {
    return {
      type: 'DuplicateError',
      message: 'A record with this information already exists'
    };
  }

  return {
    type: 'GeneralError',
    message: error.message
  };
};

module.exports = {
  slugify,
  generateUniqueSlug,
  paginateResults,
  formatError
};