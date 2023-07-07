const isApiKeyValid = require('./models/apikey');

async function checkApiKey(req, res, next) {
  authHeader = req.headers['authorization'];
  if (authHeader === undefined) {
    return res.status(400).json({ message: 'API key is missing' });
  }

  const apiKey = authHeader.substring(6);
  let check;

  try {
    check = await isApiKeyValid({ apiKey });
  } catch (e) {
    console.log(e);
    return res.sendStatus(400);
  }

  if (check === undefined) return res.sendStatus(400);
  if (check === false) return res.sendStatus(401);

  next();
}
