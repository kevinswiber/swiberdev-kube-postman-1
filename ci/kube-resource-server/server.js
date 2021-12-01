// ci/kube-resource-server/server.js

const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const yaml = require('js-yaml');

// NOTE: Change this directory to match where our
// Kubernetes resources live. This assumes they're
// in the root of our project under the "kubernetes"
// directory.
const resourceDirectory = path.join(__dirname, '..', 'kubernetes');

const app = express();

app.get('/resources', async (req, res) => {
  const canAccess = fs.access(resourceDirectory);
  if (!canAccess) {
    console.error(
      `The resource directory cannot be accessed: ${resourceDirectory}. Returning an empty array ([]).`
    );
    return res.json([]);
  }

  try {
    const files = await fs.readdir(resourceDirectory);
    const resources = files.map(async (file) => {
      const f = await fs.readFile(path.join(resourceDirectory, file), 'utf8');
      const converted = yaml.load(f); // convert YAML into JSON
      return converted;
    });

    res.json(await Promise.all(resources));
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
