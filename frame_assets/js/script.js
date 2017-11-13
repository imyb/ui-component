;(function($, window) {

    'use strict';

    window.CP = window.CP || {};

    $(function() {
        CP.menu.init();
    });


    CP.menu = {
        element : '.cpframe-menu',
        menuitem : '.cpframe-menu > ul > li',
        viewer : '.cpframe-viewer',
        init : function() {

            var _this = this;

            $(_this.menuitem).each(function() {

                var $item = $(this),
                    $anchor = $(this).children('a');

                if( $anchor.filter('[href^=#]').length ) {
                    $item.addClass('disabled');
                }

                if( $item.hasClass('active') ) {
                    _this.open( $item );
                }
            });

            $(_this.menuitem).on('click','> a', function(e) {

                var $item = $(e.delegateTarget);

                e.preventDefault();

                _this.open( $item );
            });

            //_this.open( $(_this.menuitem).eq(0) );

        },
        open : function( element ) {

            var _this = this,
                $element = $(element);

            if( $element.filter('.disabled').length ) {
                return;
            }

            _this.close( $element.siblings().filter('.active') );
            _this.view( $element );

            $element.addClass('active');
        },
        close : function( element ) {

            var _this = this,
                $element = $(element);

            $element.removeClass('active');
        },
        view : function( element ) {

            var _this = this,
                $anchor = $(element).children('a'),
                src = $anchor.attr('href');

            $(_this.viewer).attr('src', src);
        }
    };

})(window.jQuery, window);