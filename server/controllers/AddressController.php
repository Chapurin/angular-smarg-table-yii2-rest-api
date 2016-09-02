<?php

namespace app\controllers;

use Yii;
use app\models\Address;
use yii\data\ActiveDataProvider;
use yii\web\Controller;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;
use yii\db\Query;

/**
 * UserController implements the CRUD actions for User model.
 */
class AddressController extends Controller
{

    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'index'=>['get'],
                    'db-content'=>['get'],
                ],

            ]
        ];
    }


    public function beforeAction($event)
    {
        $action = $event->id;
        if (isset($this->actions[$action])) {
            $verbs = $this->actions[$action];
        } elseif (isset($this->actions['*'])) {
            $verbs = $this->actions['*'];
        } else {
            return $event->isValid;
        }
        $verb = Yii::$app->getRequest()->getMethod();

        $allowed = array_map('strtoupper', $verbs);

        if (!in_array($verb, $allowed)) {

            $this->setHeader(400);
            echo json_encode(array('status'=>0,'error_code'=>400,'message'=>'Method not allowed'),JSON_PRETTY_PRINT);
            exit;

        }

        return true;
    }

    public function actionDbContent()
    {
        set_time_limit(999999999999);
        $countryArray = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegowina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia (Hrvatska)", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "France Metropolitan", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard and Mc Donald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao, People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia, The Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia (Slovak Republic)", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "Spain", "Sri Lanka", "St. Helena", "St. Pierre and Miquelon", "Sudan", "Suriname", "Svalbard and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe"];
        $cityArray = ['Paris','Moscow','Orel','Descartes','Berlin','Novyy Chirkey','Mirnyy','Mirskoy','Moskovskoye','Moshenskoye','Gelnica','Medzev','Svit','Solkan'];
        $streetArray = ['Lenina','Dryzhby','Narimanova','Radosti','Red','Yellow','Green','Blue','Indigo'];
        $model = new Address;

        for($i=0;$i<1000000;$i++){

            $model->country = $countryArray[rand(0,(count($countryArray)-1))];
            $model->city = $cityArray[rand(0,(count($cityArray)-1))];
            $model->street = $streetArray[rand(0,(count($streetArray)-1))];
            $model->house = rand(1,1000);
            $model->postcode = rand(100000,999999);
            $model->datetime = date('c',rand(0,time()));
            $model->save(false);
            $model->id=false;
            $model->isNewRecord=true;
            $model->attributes([]);

        }
    }

    /**
     * Lists all User models.
     * @return mixed
     */
    public function actionIndex()
    {

        //echo '{"totalRows":18,"data":[{"__metadata":{"id":"31","fields":{"id":{"type":"int","unique":true},"name":{"type":"string"},"type":{"type":"string"},"description":{"type":"string"},"price":{"type":"float"}},"descriptives":{},"dates":{}},"id":31,"name":"dasfsdf","type":"","description":"","price":null}]}';
        //die();


        $params=$_REQUEST;
        $filter=[];
        $houseRangeFilter=[];
        $datetimeFilter=[];
        $sort="";
        $page=1;
        $limit=100;

        if(isset($params['page']) && is_numeric($params['page']))
        {
            $page=$params['page'];
        }


        if(isset($params['size']) && is_numeric($params['size']) && $params['size'] <= 200)
        {
            $limit=$params['size'];
        }
        $offset=$limit*($page-1);



        /* Filter elements */
        if(isset($params['search']))
        {
            $filter=(array)json_decode($params['search']);
            if(!empty($filter))
            {
                $houseRangeFilter = (array)$filter['house'];
                $datetimeFilter = (array)$filter['datetime'];
            }

        }


        if(isset($params['sort']) && preg_match('/A-z/',$params['search']))
        {
            $sort = $params['sort'];

            if($params['reverse']=='false')
            {
                $sort .= ' ASC';
            }else{
                $sort .= ' DESC';
            }



        }


        $query=new Query;
        $query->offset($offset)
            ->limit($limit)
            ->from('address')
            ->andFilterWhere(['=', 'id', $filter['id']])
            ->andFilterWhere(['like', 'country', $filter['country']])
            ->andFilterWhere(['like', 'city', $filter['city']])
            ->andFilterWhere(['like', 'street', $filter['street']])
            ->andFilterWhere(['<', 'house', $houseRangeFilter['lower']])
            ->andFilterWhere(['>', 'house', $houseRangeFilter['higher']])
            ->andFilterWhere(['like', 'postcode', $filter['postcode']])
            ->andFilterWhere(['<', 'datetime', $datetimeFilter['before']])
            ->andFilterWhere(['>', 'datetime', $datetimeFilter['after']])
            ->orderBy($sort)
            ->select('*');



        $command = $query->createCommand();
        $models = $command->queryAll();
        $totalItems = $query->count();
        $totalItems = $totalItems/$limit;


        $this->setHeader(200);
        echo json_encode(['content'=>$models,'totalPages'=>$totalItems],JSON_PRETTY_PRINT);

    }

    private function setHeader($status)
    {
        $status_header = 'HTTP/1.1 ' . $status . ' ' . $this->_getStatusCodeMessage($status);
        $content_type="application/json; charset=utf-8";

        header($status_header);
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET');
        header('Access-Control-Expose-Headers: Action-Guid');
        header('Content-type: ' . $content_type);
    }
    private function _getStatusCodeMessage($status)
    {
        // these could be stored in a .ini file and loaded
        // via parse_ini_file()... however, this will suffice
        // for an example
        $codes = Array(
            200 => 'OK',
            400 => 'Bad Request',
            401 => 'Unauthorized',
            402 => 'Payment Required',
            403 => 'Forbidden',
            404 => 'Not Found',
            500 => 'Internal Server Error',
            501 => 'Not Implemented',
        );
        return (isset($codes[$status])) ? $codes[$status] : '';
    }


}