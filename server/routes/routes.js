const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const diskStorage = multer.diskStorage({
  destination: path.join(__dirname, '../images'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + 'Picture' + file.originalname);
  },
});

const fileUpload = multer({
  storage: diskStorage,
}).single('image');

router.get('/', (req, res) => {
  res.send('Welcome to my image app');
});

router.post('/images/post', fileUpload, (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('server error');

    const type = req.file.mimetype;
    const name = req.file.originalname;
    const data = fs.readFileSync(
      path.join(__dirname, '../images/' + req.file.filename)
    );

    conn.query(
      'INSERT INTO image set ?',
      [{ type, name, data }],
      (err, rows) => {
        if (err) return res.status(500).send('server error');
        res.send('Image has upload');
      }
    );
  });
});

//SOLUTION WITH MAP

router.get('/images/get', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('server error');

    conn.query('SELECT * FROM image', (err, rows) => {
      if (err) return res.status(500).send('server error');

      rows.map((img) => {
        fs.writeFileSync(
          path.join(__dirname, '../dbImage/' + img.id + '_animal'),
          img.data
        );
      });
      const imageDir = fs.readdirSync(path.join(__dirname, '../dbImage/'));
      res.json(imageDir);
    });
  });
});

router.delete('/images/delete/:id', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) return res.status(500).send('server error');

    conn.query(
      'DELETE FROM image WHERE id = ?',
      [req.params.id],
      (err, rows) => {
        if (err) return res.status(500).send('server error');

        try {
          fs.unlinkSync(
            path.join(__dirname, '../dbImage/' + `${req.params.id}_animal`)
          );
        } catch (err) {
          console.error(err);
        }

        res.send('Deleted');
      }
    );
  });
});

//SOLUTION WITH FOR EACH

/* router.get('/images/get', (req, res) => {
  req.getConnection((err, conn) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Server error');
    }

    conn.query('SELECT * FROM image', (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Server error');
      }

      const imageDir = [];

      rows.forEach((img) => {
        const fileName = `${img.id}.jpg`;
        const filePath = path.join(__dirname, '../dbImage/', fileName);

        // Write image to file system
        fs.writeFileSync(filePath, img.data);

        // Add file name to list
        imageDir.push(fileName);
      });

      // Send list of file names to client
      res.json(imageDir);
    });
  });
}); */

module.exports = router;
