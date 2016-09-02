
###**Angular Smart-table with yii2 rest api**



Client side configuration:

client/app.js
```
.factory('Resource', function($resource) {
     return $resource('http://movie:81/server/web/address/index/');
}
```
         
Dump sql file: server/data/yii2-ang.sql.zip

Data base connection:

server/config/db.php
```
return [
    'class' => 'yii\db\Connection',
    'dsn' => 'mysql:host=localhost;dbname=yii2-ang',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8',
];
```
