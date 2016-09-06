<?php

namespace app\models;
use Yii;

class Address extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'address';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['country', 'city', 'street'], 'required'],
            [['country', 'city', 'street'], 'string'],
            [['house','postcode'], 'integer'],
            [['datetime'], 'date']
        ];
    }
    
}