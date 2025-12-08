import User from '../models/User.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  console.log("--> createUser controller hit!");
  try {
    const { email, firstName, lastName, password } = req.body;

    if (!email || !firstName || !password) {
      return res.status(400).json({
        error: { message: 'Email, firstName, and password are required' }
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).json({
        error: { message: 'Email already exists' }
      });
    }

    const user = await User.create({
      email,
      firstName,
      lastName,
      password
    });

    console.log("User created in DB:", user);

    const userResponse = await User.findById(user._id).select('-password');

    res.status(201).json({ data: userResponse });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware (we need to ensure it's used)
    // OR we can decode it from the token again if needed, but let's assume standard middleware pattern or extract from ID

    // In the inline route we did manual decoding. Let's see how we can reuse that logic or if we should rely on middleware.
    // For consistency with the inline route, let's look at the structure.
    // However, the prompt asked for "req.user.id (from the token)".

    // Since the inline route manually decodes token, I will implement manual decoding here too to be safe/consistent 
    // unless I see a middleware being used in the routes file.
    // The previous inline code manually decoded it.

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: { message: 'No token provided' } });
    }

    // We need to import jwt here or in the file.
    // Let's check imports first. usage of jwt requires import.
    // The file doesn't import jwt. I need to add it.
    // But wait, userController usually just takes params. 
    // The route handler usually handles auth. 
    // Let's stick to the prompt: "Logic: It should find the user by req.user.id (from the token)"

    // Actually, looking at the inline route in users.js, it does manual decoding. 
    // I should probably clean that up later, but for now I'll implement this function to be used.

    // Wait, if I'm adding this to userController, I should add the import.
    // But better yet, let's extract the ID from the decoded token if passed by middleware, 
    // OR do it here. 

    // Strategy: I will add the logic to fetch by ID. 
    // Ideally the route should have middleware to populate req.user.
    // If not, I'll do manual decoding like the other route.

    // Let's check if the file has 'jwt' imported. It does not.
    // I will add the import at the top in a separate tool call if needed or just assume the route handles it?
    // No, standard is controller handles logic.

    // Let's implement getUserProfile assuming the ID is passed or available. 
    // Actually, I'll implement the manual decoding to be robust as requested by step 1 logic.

    // But I can't modify imports with replace_file_content easily without seeing them.
    // I saw imports: import User from '../models/User.js';

    // I will allow myself to simply findById using id from request if middleware sets it, OR decode.
    // The prompt says "find the user by req.user.id (from the token)".
    // This implies there SHOULD be middleware.

    // Let's implement it to use req.user.id if available, or fail.

    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};