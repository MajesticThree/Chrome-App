M3.alertbox = function(options){
    this.el = $('<div class="alert"><div class="alert_content"></div></div>');
    var alert = this;
    
    function init(options) {
        options.el = options.el || $('body');
        options.close = options.close || true;
        alert.el.addClass("alert-" + options.type).addClass(options.class);
        if(options.close) {
            alert.el.prepend('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>');
        }
        alert.el.append(options.content);
        return alert;
    };
    this.changeType = function(type) {
        alert.el.removeClass("alert-info");
        alert.el.removeClass("alert-error");
        alert.el.removeClass("alert-success");
        alert.el.addClass("alert-" + type);
        return alert;
    };
    this.content = function(content) {
        this.el.find(".alert_content").html(content);
        return alert;
    };
    return init(options);
};