/**
 * Extracts page / limit from req.query and returns a slice of results.
 *
 * Usage:
 *   const { data, meta } = await paginate(Model, filter, req.query, ['field -__v']);
 */
const paginate = async (Model, filter = {}, query = {}, populate = []) => {
  const page  = Math.max(1, parseInt(query.page  ?? 1,  10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? 20, 10)));
  const skip  = (page - 1) * limit;

  const [total, data] = await Promise.all([
    Model.countDocuments(filter),
    Model.find(filter).populate(populate).skip(skip).limit(limit).lean(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
    },
  };
};

module.exports = paginate;
