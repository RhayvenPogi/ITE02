<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'firstname',
        'middlename',
        'lastname',
        'contact_number',
        'course',
        'year',
    ];
}
