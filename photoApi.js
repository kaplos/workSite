const express = require('express');
const Jimp = require('jimp');
const crypto = require('crypto');
const sharp = require('sharp');
// console.log(Jimp.read,'Jimp'); 

// const {createAdminApiClient} = require( '@shopify/admin-api-client');
// const client = createAdminApiClient({
//   accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
//   storeDomain: process.env.SHOPIFY_SHOP_NAME, 
//   apiVersion: "2025-04", 
// });
const mysql = require('mysql2');
const pool= mysql.createPool({
  host: 'localhost',     // Server address (use 'localhost' for local database)
  user: 'root',          // Username for the MariaDB
  password: process.env.MYSQL_PASSWORD,  // Your MariaDB password
  database: 'work',  // Your database name,
  waitForConnections: true,
    // port: 3306
  });

let sheetsToGet = [
   "MAIN STOCK!A:AA",
   "Belts",
   "Tod's",
   "Gucci",
   "Bally",
   "SANTONI",
   "WOMENS FERRAGAMO",
   "Wallets Mens",
   "Scarves Mens",
   "Handbags and purses",
   "HERDMAN",
   "KIRED COATS ",
   "Tod’s belts"


]
const finaleKey = process.env.FINALE_KEY
const finaleSecret = process.env.FINALE_SECRET
const shopfiAdmin = process.env.SHOPIFY_ADMIN


const PORT = 8080
const HTTPS_PORT = 8081
const http  = require('http');
const https = require('https');
const DIR = '/volume1/david';
const app = express();

const fs = require('fs').promises;
const fs1 = require('fs');
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const validImageTypes = ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'gif'];
const processQue = [];
const { randomUUID } = require('crypto');

const tieDir = path.join(DIR, 'tie');
const beltDir = path.join(DIR, 'belt');
const excelDir = path.join(DIR, 'excel');
let watermarkStatic = null; // global/shared variable

async function preloadWatermark(watermarkPath) {
  
  if (!watermarkStatic) {
    watermarkStatic = await sharp(watermarkPath).toBuffer();
    console.log("✅ Watermark preloaded.");
  }
  // if (!watermarkStatic) {
  //   watermarkStatic =  Jimp.read(watermarkPath);
  //   watermarkStatic.quality(100);
  //   console.log("✅ Watermark preloaded.");
  // }
}
// const dbFilePath = path.join(__dirname, 'localdb.sqlite');

// if (fs1.existsSync(dbFilePath)) {
//   fs1.unlinkSync(dbFilePath);
//   console.log('removed database')
// }

// const { google } = require('googleapis');
const spreadSheetId = process.env.SPREADSHEET_ID  
// let googleSheets = (async () => {
//   await generateClient();
// })()
// let auth = generateAuth();

// db.run(`CREATE TABLE IF NOT EXISTS products (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   sku TEXT NOT NULL UNIQUE,
//   brand TEXT,
//   name TEXT,
//   color TEXT ,
//   product_type TEXT,
//   sizes TEXT ,
//   retail_price DOUBLE  ,
//   amazon_price DOUBLE  ,
//   website_price DOUBLE  ,
//   ebay_price DOUBLE,
//   location TEXT ,
//   quantity INTEGER,
//   subLocation TEXT,
//   gender TEXT,
//   notes TEXT default ''
// )`
// )
// db.run(`CREATE TABLE IF NOT EXISTS returns (
//   id INTEGER PRIMARY KEY AUTOINCREMENT,
//   trackingNumber TEXT NOT NULL,
//   orderNumber TEXT DEFAULT '',
//   items TEXT,
//   created_At DATE 
//   )`)
// ;
// db.run(`CREATE TABLE IF NOT EXISTS trackingNumber(
//   id INTEGER PRIMARY KEY,  
//   trackingNumber TEXT,
//   orderNumber TEXT
// )`);


app.use(express.json());
app.use(compression());
// app.use(cors());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.startsWith("chrome-extension://") || origin === "null") {
      callback(null, true);
    } else {
      // optionally restrict to your real frontend
      callback(null, true);
    }
  },
  credentials: true,
}));


const cache = new Map();
const multer = require('multer');
const TEMPDIR = path.join(DIR,'Temp');
const tempDatabase = [];



const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // const {sku} = req.body;
    // console.log(req.body,'req.body from multer');
    //  await makeDir(sku) this goes in the cb(null, await makeDir(sku));
    cb(null,TEMPDIR); // Specify the directory where uploaded files will be stored
  },
  filename: (req, file, cb) => {
    // const {sku} = req.body;
    // Get the index of the file in the array
  // cb(null, `${sku}-${file.originalname}`)
  // cb(null,  file.originalname);
  // console.log(req.files[0],req.filenames,'req.filenames');
  const ext = path.extname(file.originalname);
  const filename = `${randomUUID()}${ext}`; // Generate a unique filename with extension
  if (!req.filenames) {
    req.filenames = [];
  }
  req.filenames.push(filename);
  // console.log(req.files,req.filenames,'req.filenames');
  cb(null, filename);
  // Generate a unique filename
  }
});
const upload = multer({ storage: storage });

app.get('/image', async (req, res) => {
  console.log('hitting here')
  const filePath = req.query.path.replaceAll('^',' ');
  console.log(filePath,'path from get photo',res)
  // let subFolder = getSubFolder(path);
  const fullfilePath = path.join(DIR, filePath);
  console.log(fullfilePath)
  const fileName = path.basename(filePath);
  try {
      if (cache.has(fileName)) {
          console.log('File found in cache');
          res.setHeader('Content-Type', 'image/jpeg');
          res.send(cache.get(fileName));
          return;
      }
      const fileData = await fs.readFile(fullfilePath);
      cache.set(fileName, fileData); // Cache the file data
      res.setHeader('Content-Type', 'image/jpeg');
      res.send(fileData);
  } catch (error) {
      console.log(`Error reading file: ${error}`);
      res.status(404).send('File not found');
  }
});
app.get('/photo/:sku/:type', async (req, res) => {
  const { sku, type} = req.params;
  console.log(`Received request for photo ID: ${sku}`);
  
  console.time('Search Directories Duration');
  try {
      const files = await searchDirectories(DIR, sku, type == 1 ? 'original' : 'watermark nyc');
      console.timeEnd('Search Directories Duration');
      res.json(files);
  } catch (error) {
      console.timeEnd('Search Directories Duration');
      console.error(`Error searching directories: ${error}`);
      res.status(500).send('Internal Server Error');
  }
});
app.get('/base64/:sku/:type' ,async(req,res)=>{
    const {sku,type} = req.params;
    console.log(`Received request for photo ID: ${sku}`);
    console.time('Search Directories Duration');
    try {
        const files = await searchDirectories(DIR, sku, type == 1 ? 'original' : 'watermark nyc',true);
        console.timeEnd('Search Directories Duration');
        res.json(files);
    } catch (error) {
        console.timeEnd('Search Directories Duration');
        console.error(`Error searching directories: ${error}`);
        res.status(500).send('Internal Server Error');
    }

})
// app.get('/photo/:sku/:type/:filename', async (req, res) => {
//   const { sku, type, filename } = req.params;
  // let subFolder = getSubFolder(sku);

//   const filePath = path.join(DIR,subFolder, sku, type, filename);
//   try {
//       if (cache.has(filename)) {
//           console.log('File found in cache');
//           res.setHeader('Content-Type', 'image/jpeg');
//           res.send(cache.get(filename));
//           return;
//       }
//       const fileData = await fs.readFile(filePath);
//       cache.set(filename, fileData); // Cache the file data
//       res.setHeader('Content-Type', 'image/jpeg');
//       res.send(fileData);
//   } catch (error) {
//       console.error(`Error reading file: ${error}`);
//       res.status(404).send('File not found');
//   }
// });


app.get('/temp/:filename', async (req, res) => {
  // console.log(req.body,'req.body from temp');
  if(cache.has(req.params.filename)){
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(cache.get(req.params.filename));
    // console.log('sent from cache',cache.get(req.params.filename));
  }else{
    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(path.join(TEMPDIR,req.params.filename));
  }
})
app.get('/', (req, res) => {
  res.send('Hello World');
});
app.get('/cached', (req, res) => {
  res.send('Cached files: ' + [...cache.keys()].join(', '));
});

// this is product creation (product image uploader)
app.get('/checksku', async (req, res) => {
  const { sku } = req.query;
  console.log(`Received request for sku: ${sku}`);
  res.json({exists: await checkDataBaseForSku(sku)})
})
app.delete('/deleteReturn', async (req, res) => {
  const { id } = req.body;
  console.log(`Received request for id: ${id}`);
  pool.query(`DELETE FROM returns WHERE id = ?`,[id],(err,rows)=>{
    if(err) console.log(err);
    res.json(rows);
  })
})
app.post('/upload',upload.array('images'), async (req,res)=>{
  // console.log(req.files,'req.files from request');
  console.log(req.body,'req.body from request');
  let images = await Promise.all(req.files.map(async (file) => {
    // console.log(file,'file');
    let filename = file.filename.replaceAll(' ','_')
    cache.set(filename, await fs.readFile(file.path));
    // console.log(cache)
    // return `https://api.candminc.store/temp/${req.body.sku}-${file.originalname}`
    return `https://api.candminc.store/temp/${filename}`
  }));
  console.log(images,'images');
  res.status(200).json({message:"success", images:images});

})
app.post('/addProducts',async (req,res)=>{
  // console.log(req.body,'req.body from addProduct');
  const products = req.body;
  console.log(products,'products');
  res.status(200).json({"success":true});
  products.forEach(productObject =>{ processQue.push(productObject)})
  // processQue.enqueue(products);
  startProcessing();

})
//  this will be for returns
  app.post('/return', async (req, res) => {
    try {
      const result = await saveReturnInfo(req.body);
      res.status(200).json(result); // Respond with success and the new ID
    } catch (error) {
      console.error('Error saving return info:', error);
      res.status(500).json({ success: false, error: error.message });
    }
})
app.get('/search', async (req, res) => {
  const { term } = req.query;

  if (!term || term.trim() === '') {
    return res.status(400).json({ error: 'Search term is required' });
  }

  console.log(term, 'from req');

  try {
    const [uploadResults, returnResults] = await Promise.all([
      getUploadInfo(term),
      getReturnInfo(term),
    ]);

    console.log(uploadResults,returnResults,'data from both functions ')
    // const combinedResults = [...uploadResults, ...returnResults];
    if (uploadResults.length ===0 && returnResults.length ===0 ) {
      return res.status(200).json([]);
    }

    res.status(200).json(uploadResults.length === 0 ? {type: 'return' , value:returnResults}: {type:'upload',value:uploadResults}
    );
  } catch (error) {
    console.error('Error during search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
app.get('/getSizes',async(req,res)=>{
  const { sku } = req.query;
  res.json(await getSizes(sku))
})
app.get('/getUnrefunded',async (req,res)=>{
   pool.query(`Select * from returns where refunded = 0`,(err,rows)=>{
    if(err) console.log(err);
    res.json(rows);
  })
})
app.get('/id',async(req,res)=>{
  const {page,id} = req.query
  console.log(page ==='upload'? await getSpecificUpload(id): await getSpecificReturn(id) )
  res.status(200).json(page ==='upload'? await getSpecificUpload(id): await getSpecificReturn(id) );
})
app.post('/update',async(req,res)=>{
  console.log(req.body,'req.body from update');
  const { type, ...object } = req.body; // Extract type and keep the rest of the object
   
  let success = false;

    switch(type){
      case 'upload':
        success = await saveUploadInfoById(object);
        break;
      case 'return':
        success = await saveReturnInfoById(object);
        break;
    }
    console.log(success,'success? after update');
  res.status(200).json(success);
})

const SHOPIFY_SECRET = process.env.SHOPIFY_API_SECRET; 

function bypassJsonParsing(req, res, next) {
  req.rawBody = req.body;  // Store raw body for later use
  next();
}

app.post('/webhook', bypassJsonParsing, (req, res) => {

const shopifyHmac = req.headers['x-shopify-hmac-sha256'];  // Shopify HMAC from the header
  const bodyString = req.rawBody.toString('utf8');  // Convert raw body to a string (this should be the JSON payload)

  // Ensure that bodyString is valid for crypto.update() (it needs to be a string or buffer)
  const calculatedHmacDigest = crypto
    .createHmac('sha256', SHOPIFY_SECRET) // Use your actual Shopify secret
    .update(bodyString, 'utf8')  // Ensure you're passing a string to .update()
    .digest('base64');  // Base64 encode the result

  // Compare the calculated HMAC with the one sent by Shopify in the header
  const hmacValid = crypto.timingSafeEqual(
    Buffer.from(calculatedHmacDigest),  // The calculated HMAC
    Buffer.from(shopifyHmac)            // The HMAC sent by Shopify in the header
  );

  if (hmacValid) {
    console.log('✅ HMAC validated successfully!');
    res.status(200).send('Webhook received and validated.');
  } else {
    console.warn('❌ HMAC validation failed.');
    res.status(401).send('HMAC validation failed.');
  }
});



const sslOptions = {
    key: fs1.readFileSync(`${__dirname}/private.key`),
    cert: fs1.readFileSync(`${__dirname}/certificate.crt`)
  };
  http.createServer(app).listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
});
  https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`HTTPS server running on port ${HTTPS_PORT}`);
  });


  

  
  
  async function searchDirectories(dir, searchKey, type, base64 = false) {
    let subFolder = getSubFolder(searchKey);
    let results = [];
    try {
      let folderPath = path.join(dir, subFolder,searchKey,type)
      
      const files = await fs.readdir(folderPath);
      console.log(folderPath,'folderPath in search directories',files,"files");
      for (const file of files) {
        const fileFullPath = path.join(folderPath, file);
        const fileStat = await fs.stat(fileFullPath);

        // Check if the file is a photo
        const photoExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'];
        const ext = path.extname(file).toLowerCase();
        if (fileStat.isFile() && photoExtensions.includes(ext)) {
          const fileData = await fs.readFile(fileFullPath);
          if (base64) {
            const base64Data = fileData.toString('base64');
            results.push({ data: base64Data });
          } else {
            results.push({ url: `/image?path=${path.join(subFolder,searchKey,type,file).replaceAll(' ',"^")}` });
            cache.set(file, fileData);
          }
        }
      }
      
      
    } catch (err) {
      console.error('Unable to scan directory: ' + err);
    }
    return results;
  }
  function getSubFolder(sku){
    return sku.includes('tie')? 'tie': sku.includes('belt')? 'belt': sku.split('-')[0];

  }
  async function makeDir(sku) {

    try {
      // const dirPath = path.join(getDirectory(sku),'test', sku);
      const dirPath = path.join(DIR,'test', sku);
      if (!fs1.existsSync(dirPath)) {
        await fs.mkdir(dirPath, { recursive: true });
      }
      fs.mkdir(path.join(dirPath,'original'),{recursive:true},(err)=>{if(err) console.log(err);});
      fs.mkdir(path.join(dirPath,'watermark nyc'),{recursive:true},(err)=>{if(err) console.log(err);});
      return dirPath;
    } catch (err) {
      console.error(err);
      throw err; // Re-throw the error after logging it
    }
  }
  function getDirectory(sku) {
    if (sku.toLowerCase().includes('tie')) {
      return tieDir;
    } else if (sku.toLowerCase().includes('belt')) {
      return beltDir;
    } else {
      return DIR;
    }
  }
  async function addProductToDatabase(sku,notes){
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO products (sku, notes) VALUES (?, ?)`;
  
      pool.promise().execute(query, [sku, notes])
        .then(([result]) => {
          console.log(`A row has been inserted with rowid ${result.insertId}`);
          resolve(result.insertId); // Return the last inserted ID
        })
        .catch(err => {
          console.error("Error adding product to database:", err.message);
          reject(new Error("Failed to insert product"));
        });
    });
  }
  async function addProductToFolder(sku,images){
    const imageFileNames = getImageFileNames(images);
    const dirPath = await makeDir(sku);
    for(let i = 0 ; i<imageFileNames.length;i++){
      let fileName = imageFileNames[i];
      let ext = path.extname(imageFileNames[i])
      fileName = `${sku}-${i}${ext}`;
      try{
        console.log('moving photo')
        console.time(`move photo ${sku}:`)
        await fs.rename(path.join(TEMPDIR,imageFileNames[i]), path.join(dirPath,'original',`${fileName}`));
        console.timeEnd(`move photo ${sku}:`)

        console.log('starting watermark')
        console.time(`watermark time ${sku}:`)
        await addWatermarkSharp(path.join(dirPath,'original',`${fileName}`),path.join(dirPath,'watermark nyc',`NYC_Designer_outlet_${fileName}`));
        console.timeEnd(`watermark time ${sku}:`)
      }catch(err){
        console.log(err,"skipping file");
      }
    }
    return true

   


  }

  function getImageFileNames(images){
     return images.map(image =>{
      const url = new URL(image);
      return url.pathname.split('/').pop().replaceAll(' ',"_");
    })
    
  }
  function generateAuth() {
    return new google.auth.GoogleAuth({
      keyFile: 'Credentials.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  async function generateClient(){
    const googleClient = await auth.getClient();
    const googleSheets = google.sheets({ version: 'v4', auth: googleClient });
    return googleSheets;
  }

  async function saveReturnInfo(body){
    const { trackingNumber, orderNumber, items, refunded } = body;
    const jsonSerializedItems = JSON.stringify(items);

    return new Promise((resolve, reject) => {
          const query = `INSERT INTO returns (trackingNumber, orderNumber, items, created_At, refunded) 
                        VALUES (?, ?, ?, NOW(), ?)`;  // Using NOW() to insert the current timestamp
          
          pool.promise().execute(query, [trackingNumber, orderNumber, jsonSerializedItems, refunded])
            .then(result => {
              resolve({ success: true, id: result[0].insertId });
            })
            .catch(err => {
              reject(err);
            });
          });
        
  }

  async function saveReturnInfoById(body) {
  const { id, trackingNumber, orderNumber, items, refunded } = body;
    const jsonSerializedItems = JSON.stringify(items);
    const formattedRefundDate = refunded ? new Date().toISOString().slice(0, 23).replace('T', ' ') : null; // Corrected line
    console.log(id, trackingNumber, orderNumber, items, refunded, formattedRefundDate, jsonSerializedItems, 'jsonSerializedItems')
    
    return new Promise((resolve, reject) => {
        const query = `
            UPDATE returns 
            SET trackingNumber = ?, 
                orderNumber = ?, 
                items = ?, 
                refunded = ?, 
                refunded_At = ? 
            WHERE id = ?
        `;
      
        pool.promise().execute(query, [trackingNumber, orderNumber, jsonSerializedItems, refunded, formattedRefundDate, id])
          .then(result => {
            if (result.affectedRows === 0) {
                // If no rows were updated, the ID does not exist
                reject(new Error("No record found with the provided ID"));
            } else {
                resolve({ message: "Record updated successfully", success: true });
            }
        })
        .catch(err => {
          console.log(err,'error in saveReturnInfoById')
            reject({error: err,message:"Failed to update return info"});
        });
    });
  }

  async function saveUploadInfoById(body) {
    const { id, ...rest } = body; // Extract 'id' and keep the rest of the object
    if (!id) {
        throw new Error("Product ID is required for update.");
    }

    // Convert images to JSON string
    if (rest.images) {
        rest.images = JSON.stringify(rest.images);
    }

    // Prepare keys and values for the query
    const keys = Object.keys(rest);
    const values = Object.values(rest);
    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    values.push(id); // Add ID at the end for the WHERE clause

    const query = `UPDATE products SET ${setClause} WHERE id = ?`;
    
    console.log(query, values, 'query and values');

    return new Promise((resolve, reject) => {
        pool.query(query, values, (err, result) => {
            if (err) {
                console.error(err.message);
                return reject(err);
            }

            if (result.affectedRows === 0) {
                console.log("No record found with the provided ID");
                return reject(new Error("No record found with the provided ID"));
            }

            console.log("Record updated successfully");
            resolve({ message: "Record updated successfully", success: true });
        });
    });
  }

  async function getUploadInfo(term) {
    let data = await checkDataBaseForNameInfo(term)
    console.log(data,'upload info before return')
    return data.length > 0 ? data: [];
  }
  async function checkDataBaseForNameInfo(term){
    console.log('term',term)
    const searchTerm = `%${term.trim()}%`;
    const query = `SELECT * FROM products WHERE name LIKE ? OR sku LIKE ?`;

    return new Promise((resolve, reject) => {
        pool.query(query, [searchTerm, searchTerm], (err, rows) => {
            if (err) {
                console.error(err.message);
                return reject(err);
            }
            
            resolve(rows.length > 0 ? rows : []);
        });
    });
  }
 
  async function getReturnInfo(term) {
    let data = await checkDataBaseForOrderNumber(term)
    console.log(data,'return info before return')
    
    return data.length > 0 ? data : [];
  }
  
  async function checkDataBaseForOrderNumber(term){
    console.log('term',term)
    const searchTerm = `%${term.trim()}%`;
    const query = `SELECT * FROM returns WHERE orderNumber LIKE ? OR trackingNumber LIKE ?`;

    return new Promise((resolve, reject) => {
        pool.query(query, [searchTerm, searchTerm], (err, rows) => {
            if (err) {
                console.error(err.message);
                return reject(err || 'No results found');
            }

            resolve(rows.length === 0 ? [] : rows);
        });
    });
  }
  async function getSpecificReturn(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM returns WHERE id = ?`;
      pool.promise().execute(query, [id])
        .then(([rows]) => {
          if (rows.length > 0) {
            resolve(rows[0]); // Return first row if exists
          } else {
            resolve(null); // Return null if no row found
          }
        })
        .catch(err => {
          console.error("Error retrieving return:", err.message);
          reject(new Error("Failed to retrieve return data"));
        });
    });
  }
  async function getSpecificUpload(id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM products WHERE id = ?`;
  
      pool.promise().execute(query, [id])
        .then(([rows]) => {
          if (rows.length > 0) {
            resolve(rows[0]); // Return first row if exists
          } else {
            resolve(null); // Return null if no row found
          }
        })
        .catch(err => {
          console.error("Error retrieving product:", err.message);
          reject(new Error("Failed to retrieve product data"));
        });
    });
  }

  async function checkDataBaseForSku(sku){
    return new Promise((resolve, reject) => {
      const query = `SELECT sku FROM products WHERE sku = ?`;

      pool.promise().execute(query, [sku])
        .then(([rows]) => {
          resolve(rows.length > 0); // If row exists, return true, else false
        })
        .catch(err => {
          console.error("Error checking SKU:", err.message);
          reject(new Error("Failed to check SKU existence"));
        });
    });
  }
  async function getSizes(sku){
    return new Promise((resolve, reject) => {
      const query = `Select * from shoeWidth where subSku = ?`
      pool.promise().execute(query, [sku])
        .then(([rows]) => {
          resolve(rows); // If row exists, return true, else false
        })
        .catch(err => {
          console.error("Error checking SKU:", err.message);
          reject(new Error("Failed to check SKU existence"));
        });
    })
  }
  async function startProcessing(){
    // let newProduct = products.map((product)=>{ return {sku:product.sku}})
    // console.log(newProduct,'newProduct');
    console.log('processing new photos :' ,processQue.length)
    // while (processQue.length > 0) {
    //   let productToProcess = processQue.shift();

    //   console.time('processing time')
    //   await addProductToFolder(productToProcess.sku, productToProcess.images);
    //   await addProductToDatabase(productToProcess.sku, productToProcess.notes);
    //   console.timeEnd('processing time')
    // }
    const processPromises = processQue.map(productToProcess => {
      return (async () => {
        console.time(`processing time: ${productToProcess.sku}`);
        await addProductToFolder(productToProcess.sku, productToProcess.images);
        await addProductToDatabase(productToProcess.sku, productToProcess.notes);
        console.timeEnd(`processing time: ${productToProcess.sku}`);
      })();
    });
    
    await Promise.all(processPromises);
    
    console.log('processing complete')

  }

  async function addWatermark1(inputImage, outputImage, watermarkImage, position = null) {
    const image = await Jimp.read(inputImage);
    const watermark = await Jimp.read(watermarkImage);
    watermark.quality(100);
    const resizeFactor = position == 1 ? 1 : 1; // Change this to make the watermark bigger or smaller
    watermark.resize(image.bitmap.width * resizeFactor, Jimp.AUTO);
  
    // Divide the image into sections and calculate the average brightness of each section
    const sections = [];
    const sectionSize = 100; // Change this to change the size of the sections
    for (let y = 0; y < image.bitmap.height; y += sectionSize) {
        for (let x = 0; x < image.bitmap.width; x += sectionSize) {
            let totalBrightness = 0;
            let count = 0;
            for (let sy = y; sy < y + sectionSize && sy < image.bitmap.height; sy++) {
                for (let sx = x; sx < x + sectionSize && sx < image.bitmap.width; sx++) {
                    const pixelColor = Jimp.intToRGBA(image.getPixelColor(sx, sy));
                    const brightness = (0.299 * pixelColor.r + 0.587 * pixelColor.g + 0.114 * pixelColor.b) / 255;
                    totalBrightness += brightness;
                    count++;
                }
            }
            const averageBrightness = totalBrightness / count;
            sections.push({ x, y, averageBrightness });
        }
    }
  
    // Apply a light or dark watermark based on the average brightness of each section
    for (const section of sections) {
        const contrastColor = section.averageBrightness < 0.5 ? Jimp.rgbaToInt(255, 255, 255, 255) : Jimp.rgbaToInt(169, 169, 169, 255);
        watermark.scan(section.x, section.y, sectionSize, sectionSize, function(sx, sy, idx) {
            // Only apply the contrast color where the watermark image is not transparent
            if (this.bitmap.data[idx + 3] !== 0) {
                this.bitmap.data[idx + 0] = Jimp.intToRGBA(contrastColor).r;
                this.bitmap.data[idx + 1] = Jimp.intToRGBA(contrastColor).g;
                this.bitmap.data[idx + 2] = Jimp.intToRGBA(contrastColor).b;
            }
        });
    }
  
    const moveAmount = 20; // Change this to move the watermark more or less
    const x = ((image.bitmap.width / 2) - (watermark.bitmap.width / 2)) + moveAmount;
    const y = ((image.bitmap.height / 2) - (watermark.bitmap.height / 2)) + moveAmount;
    image.composite(watermark, x, y, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.7 // Change this to make the watermark more or less transparent
    });
    await image.writeAsync(outputImage);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  async function addWatermarkOriginal(inputImage,outputImage,watermarkImage){
    const image = await Jimp.read(inputImage);
    const watermark = await Jimp.read(watermarkImage);
    watermark.quality(100)
    watermark.resize(image.bitmap.width * 1, Jimp.AUTO);
    // watermark.brightness(0.2); 
    const x = (image.bitmap.width / 2) - (watermark.bitmap.width / 2);
    const y = (image.bitmap.height / 2) - (watermark.bitmap.height / 2);
    image.composite(watermark,x,y,{
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource:0.50
    });
    await image.writeAsync(outputImage);
    console.log('added watermark : ', outputImage)
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

async function addWatermarkSharp(inputImage, outputImage, watermarkBuffer = null) {
  const ext = path.extname(inputImage).slice(1).toLowerCase();
  if (!validImageTypes.includes(ext)) {
    console.log(`Skipping non-image file: ${inputImage}`);
    return;
  }

  const image = sharp(inputImage);
  const metadata = await image.metadata();

  // Load watermark buffer or image from file if not preloaded
  if (!watermarkStatic) {
    await preloadWatermark(path.join(DIR,'NYC DESIGNER OUTLET WATERMARK.png'))
  }

  // Resize watermark to be half the width of the main image
  const watermarkResized = await sharp(watermarkStatic)
    .resize({ width: Math.floor(metadata.width * 1) })
    .png()
    .toBuffer();

  const watermarkMeta = await sharp(watermarkResized).metadata();

  // Calculate center position with offset
  const moveAmount = 20;
  const left = Math.floor((metadata.width - watermarkMeta.width) / 2) + moveAmount;
  const top = Math.floor((metadata.height - watermarkMeta.height) / 2) + moveAmount;

  await image
    .composite([{
      input: watermarkResized,
      top,
      left
    }])
    .toFile(outputImage);

  console.log(`Watermarked image saved to ${outputImage}`);
  return watermarkStatic; // So you can reuse it if desired
}
async function addWatermarkContrast(inputImage, outputImage, watermarkImage, position = 'center') {
  const ext = path.extname(inputImage).slice(1).toLowerCase();
  if (!validImageTypes.includes(ext)) {
    console.log(`❌ Skipping unsupported file: ${inputImage}`);
    return;
  }

  const image = await Jimp.read(inputImage);
  if(!watermarkStatic){
    await preloadWatermark(path.join(DIR,'NYC DESIGNER OUTLET WATERMARK.png'))
  }
  const watermark = watermarkStatic.clone();
  watermark.quality(100);

  // Resize watermark to 30% of image width (adjust as needed)
  const resizeFactor = position == 1 ? 1 : 1; // Change this to make the watermark bigger or smaller
  watermark.resize(image.bitmap.width * resizeFactor, Jimp.AUTO);

  const margin = 20;
  let x = 0, y = 0;

  // Calculate position
  switch (position) {
    case 'top-left':
      x = margin;
      y = margin;
      break;
    case 'top-right':
      x = image.bitmap.width - watermark.bitmap.width - margin;
      y = margin;
      break;
    case 'bottom-left':
      x = margin;
      y = image.bitmap.height - watermark.bitmap.height - margin;
      break;
    case 'bottom-right':
      x = image.bitmap.width - watermark.bitmap.width - margin;
      y = image.bitmap.height - watermark.bitmap.height - margin;
      break;
    case 'center':
    default:
      x = (image.bitmap.width - watermark.bitmap.width) / 2;
      y = (image.bitmap.height - watermark.bitmap.height) / 2;
      break;
  }

  // Adjust watermark pixel colors based on background brightness
  watermark.scan(0, 0, watermark.bitmap.width, watermark.bitmap.height, function (sx, sy, idx) {
    const alpha = this.bitmap.data[idx + 3];
    if (alpha !== 0) {
      const bgX = Math.min(image.bitmap.width - 1, Math.max(0, sx + x));
      const bgY = Math.min(image.bitmap.height - 1, Math.max(0, sy + y));
      const bgRGBA = Jimp.intToRGBA(image.getPixelColor(bgX, bgY));

      const brightness = (0.299 * bgRGBA.r + 0.587 * bgRGBA.g + 0.114 * bgRGBA.b) / 255;
      const contrastRGBA = brightness > 0.5
        ? { r: 0, g: 0, b: 0, a: alpha }       // black on bright
        : { r: 255, g: 255, b: 255, a: alpha } // white on dark

      this.bitmap.data[idx + 0] = contrastRGBA.r;
      this.bitmap.data[idx + 1] = contrastRGBA.g;
      this.bitmap.data[idx + 2] = contrastRGBA.b;
    }
  });

  image.composite(watermark, x, y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: 1
  });

  await image.writeAsync(outputImage);
  console.log(`✅ Saved watermarked image to ${outputImage}`);
}

  const getReturns = `
  query getReturns {
      orders( first:100,reverse:true , query:"return_status:in_progress" ) {
        nodes {
          id
          name
        }
      }
    }
`
  
  preloadWatermark(path.join(DIR,'NYC DESIGNER OUTLET WATERMARK.png'))
  // async function testing(){
  //   console.time('testing watermark') 
  //     await addWatermarkSharp('/volume1/david/test/testing123/original/324ca614-091a-4506-878a-e2b007155078.jpg','/volume1/david/test/testing123/watermark nyc/testing123-0.jpg',watermarkStatic)
  //   console.timeEnd('testing watermark') 

  // }
  // testing()
  
  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  



//   async function performTask() {
//     console.log('Task is running at:', new Date().toISOString());
    
//     const {data,errors} = await client.request(getReturns)
//     if(errors){
//       console.err(errors);
//     }

//   }

// // Schedule the task to run every 24 hours
// setInterval(performTask, ONE_DAY_IN_MS);

// // Optionally, run the task immediately on startup
// performTask();