
###**Angular Smart-table with yii2 rest api**
------------

###Demo
http://smart-table-client.onbird.ru/


###Install
Unzip or colone this repository in Web folder.


###Database configuration

Execute dump sql file into data base `server/data/yii2-ang.sql.zip`

Edit the file `server/config/db.php` with real data to connect to your data base, for example:

```php
return [
    'class' => 'yii\db\Connection',
    'dsn' => 'mysql:host=localhost;dbname=yii2-angular',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8',
];
```

###Client side configuration

Edit the file `client/app.js` with url to server side
```
.factory('Resource', function($resource) {
     return $resource('http://localhost/server/web/address/index/');
}
```
         



###Run
You can then access the server side through the following URL:

~~~
http://localhost/server/web/address/index/
~~~

And you can then access the client side through the following URL:

~~~
http://localhost/client/index.html
~~~
