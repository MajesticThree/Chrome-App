/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


M3.ui = {
    top_bar: null,
    init: function() {
        this.top_bar = $('#top_bar');
        this.update();
    },
    update: function() {
        $('textarea').on('keyup', function() {
            if($(this).val() != "") {
                $(this).addClass('valid');
            } else {
                $(this).removeClass('valid');
            }
        })
    }
};