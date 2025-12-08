import Report from '../models/Report.js';

// Get Reports with Advanced Filtering, Searching, Sorting, and Pagination
export const getReports = async (req, res, next) => {
  try {
    const { category, doctor, search, sort, page = 1, limit = 10 } = req.query;

    // 1. Base Query: User can only see their own reports
    const query = { user: req.user.id };

    // 2. Filtering
    if (category) {
      query.category = category;
    }
    if (doctor) {
      query.doctor = doctor;
    }

    // 3. Searching (Case-insensitive regex on title)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // 4. Sorting
    let sortOptions = { createdAt: -1 }; // Default: Newest first (by creation)
    if (sort) {
      if (sort === 'date') {
        sortOptions = { reportDate: 1 }; // Oldest report date first
      } else if (sort === '-date') {
        sortOptions = { reportDate: -1 }; // Newest report date first
      } else {
        // Handle other sort fields if needed, or default
        // checks for descending order prefix '-'
        const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
        const sortOrder = sort.startsWith('-') ? -1 : 1;
        sortOptions = { [sortField]: sortOrder };
      }
    }

    // 5. Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute Query
    const reports = await Report.find(query)
      .populate('doctor', 'name specialization hospital')
      .populate('user', 'firstName lastName email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    // Get Total Count for Pagination
    const total = await Report.countDocuments(query);

    res.json({
      data: reports,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ensure user can only view their own report
    const report = await Report.findOne({ _id: id, user: req.user.id })
      .populate('user', 'firstName lastName email')
      .populate('doctor', 'name specialization hospital');

    if (!report) {
      return res.status(404).json({ error: { message: 'Report not found' } });
    }

    res.json({ data: report });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
  try {
    const { title, description, fileUrl, category, reportDate, doctor } = req.body;

    // Note: fileUrl should come from req.file.path in the route if using middleware there, 
    // but here we expect it in body if handled previously or passed down.
    // However, the previous implementation in routes/reports.js handled file upload.
    // We'll assume the route passes the file url or body contains it.
    // If the route handles upload, it should put fileUrl in req.body or we handle it here.

    // Let's assume the route puts the cloudinary URL into req.body.fileUrl 
    // OR we handle it if req.file exists.

    let finalFileUrl = fileUrl;
    if (req.file && req.file.path) {
      finalFileUrl = req.file.path;
    }

    if (!title || !category || !reportDate) {
      return res.status(400).json({
        error: { message: 'Title, category, and reportDate are required' }
      });
    }

    const report = await Report.create({
      title,
      description,
      fileUrl: finalFileUrl,
      category,
      reportDate: new Date(reportDate),
      user: req.user.id,
      doctor: doctor || undefined // Optional doctor link
    });

    const populatedReport = await Report.findById(report._id)
      .populate('user', 'firstName lastName')
      .populate('doctor', 'name specialization');

    res.status(201).json({ data: populatedReport });
  } catch (error) {
    next(error);
  }
};

export const updateReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl, category, reportDate, doctor } = req.body;

    const report = await Report.findOneAndUpdate(
      { _id: id, user: req.user.id }, // Ensure ownership
      {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(fileUrl !== undefined && { fileUrl }),
        ...(category && { category }),
        ...(reportDate && { reportDate: new Date(reportDate) }),
        ...(doctor !== undefined && { doctor }) // Allow clearing doctor with null?
      },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName');

    if (!report) {
      return res.status(404).json({ error: { message: 'Report not found or unauthorized' } });
    }

    res.json({ data: report });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await Report.findOneAndDelete({ _id: id, user: req.user.id }); // Ensure ownership

    if (!report) {
      return res.status(404).json({ error: { message: 'Report not found or unauthorized' } });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};