
import fs from 'node:fs';
import https from 'node:https';
import path from 'node:path';

const logos = [
    { url: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Shopee.svg", file: "shopee.svg" },
    { url: "https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/6.6.1/mercadolibre/logo__large_plus@2x.png", file: "mercadolivre.png" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", file: "amazon.svg" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Magazine_Luiza_logo.svg", file: "magalu.svg" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Temu_logo.svg/2560px-Temu_logo.svg.png", file: "temu.png" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/81/Shein_Logo.svg", file: "shein.svg" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Americanas_logo.svg", file: "americanas.svg" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/AliExpress_logo.svg/2560px-AliExpress_logo.svg.png", file: "aliexpress.png" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Wish_logo.svg", file: "wish.svg" }
];

const dir = 'public/images/marketplaces';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

logos.forEach(logo => {
    const filePath = path.join(dir, logo.file);
    const file = fs.createWriteStream(filePath);
    https.get(logo.url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, function(response) {
        if (response.statusCode === 200) {
            response.pipe(file);
            file.on('finish', function() {
                file.close(() => console.log(`Downloaded ${logo.file}`));
            });
        } else {
            console.error(`Failed to download ${logo.file}: Status Code ${response.statusCode}`);
            fs.unlink(filePath, () => {}); // Delete empty file
        }
    }).on('error', function(err) {
        fs.unlink(filePath, () => {});
        console.error(`Error downloading ${logo.file}: ${err.message}`);
    });
});
