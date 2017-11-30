;(function($, window) {

    'use strict';

    window.DOCS = window.DOCS || {};

    $(function() {
        DOCS.menu.init();
    });


    DOCS.menu = {
        element : '.docs-frame__menu',
        menuitem : '.docs-frame__menu__item',
        viewer : '.docs-frame__viewer',
        init : function() {

            var _this = this;

            $(_this.menuitem).each(function() {

                var $item = $(this),
                    $anchor = $(this).children('a');

                if( $anchor.filter('[href^=#]').length ) {
                    $item.addClass('is-disabled');
                }

                if( $item.hasClass('is-active') ) {
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

            if( $element.filter('.is-disabled').length ) {
                return;
            }

            _this.close( $element.siblings().filter('.is-active') );
            _this.view( $element );

            $element.addClass('is-active');
        },
        close : function( element ) {

            var _this = this,
                $element = $(element);

            $element.removeClass('is-active');
        },
        view : function( element ) {

            var _this = this,
                $anchor = $(element).children('a'),
                src = $anchor.attr('href');

            $(_this.viewer).attr('src', src);
        }
    };

})(window.jQuery, window);