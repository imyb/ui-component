
;(function($, window) {

    'use strict';

    var UI = window.UI || {};

    window.UI = UI;

    $(document).ready(function(){

    });




    /* ==========================================================================
     * UI.util
     * ========================================================================== */
    function getScrollbarWidth() {
        var windowInnerWidth = window.innerWidth;

        if( !windowInnerWidth ) {

          var documentElementRect = document.documentElement.getBoundingClientRect();

          windowInnerWidth = documentElementRect.right - Math.abs(documentElementRect.left);
        }

        return windowInnerWidth - document.body.clientWidth;
    }


    function getTransition() {
        var fakeelement = document.createElement('fakeelement'),
            transitionEndEventName = {
                WebkitTransition : 'webkitTransitionEnd',
                MozTransition    : 'transitionend',
                OTransition      : 'oTransitionEnd otransitionend',
                transition       : 'transitionend'
            };

        for( var name in transitionEndEventName ) {
            if( fakeelement.style[name] !== undefined ) {
                return transitionEndEventName[name];
            }
        }

        return false;
    }


    $.fn.transitionEndAfter = function(callback, duration) {
        var _this = this,
            called = false,
            transitionend = getTransition();

        $(this).one(transitionend, function() {
            called = true;
            callback();
        });

        setTimeout(function () {
            if( !called ) {
                $(_this).trigger(transitionend);
            }
        }, duration);

        return this;
    };


    function getSiblings(element) {
        var siblings = [];
        var sibling = element.parentNode.firstChild;
        for (; sibling; sibling = sibling.nextSibling) {
            if (sibling.nodeType !== 1 || sibling === element) continue;
            siblings.push(sibling);
        }
        return siblings;
    }


    /* ==========================================================================
     * UI.tab
     * ========================================================================== */
    UI.tab = (function() {

        var UI_NAME = 'UI.tab';

        var SELECTOR = {
            TAB : '[data-ui-tab="tab"]',
            PANEL : '[data-ui-tab="panel"]'
        };

        var STATE = {
            IS_ACTIVE : 'active'
        };

        var EVENT = {
            CLICK_OPEN : 'click.tab:open'
        };

        var tab = {
            handleTabClick : function(element) {
                var _this = this;
                var element = element[0] || element;

                this.open(element);
            },
            open : function(element) {
                var _this = this;
                var element = element[0] || element;
                var siblings = getSiblings(element.parentElement);
                var target = this._getTarget(element);

                if( target.item.classList.contains('is-active') ) {
                    return;
                }

                target.item.classList.add('is-active');

                if( target.panel ) {
                    target.panel.classList.add('is-active');
                }

                for( var i in siblings ) {
                    _this.close(siblings[i].children[0]);
                }
            },
            close : function(element) {
                var target = this._getTarget(element);

                if( target.item.classList.contains('is-active') ) {
                    target.item.classList.remove('is-active');
                }

                if( target.panel ) {
                    if( target.panel.classList.contains('is-active') ) {
                        target.panel.classList.remove('is-active');
                    }
                }
            },
            _getTarget : function(element) {
                var target = {};

                target.item = element.parentElement;
                target.panel = document.querySelector(SELECTOR.PANEL + '#'+ element.getAttribute('aria-controls'));

                return target;
            }
        };

        document.addEventListener('click', function(e) {
            e.preventDefault();
            if(!e.target.closest(SELECTOR.TAB)) return;

            var element = e.target.closest(SELECTOR.TAB);


            if( !element ) {
                return;
            }

            tab.handleTabClick(element);
        });

        return tab;

        /*var tab = {
            element : '[data-ui-tab="tab"]',
            panel : '[data-ui-tab="panel"]',
            open : function(element) {
                var _this = this;
                var target = _this._getTarget( element );

                if( target.item.hasClass('is-active') ) {
                    return;
                }

                target.item.addClass('is-active');

                if( target.panel.length ) {
                    target.panel.addClass('is-active');
                }

                _this.close( target.item.siblings().filter('.is-active').children(_this.element) );
            },
            close : function(element) {
                var _this = this;
                var target = _this._getTarget( element );

                if( !target.item.hasClass('is-active') ) {
                    return;
                }

                target.item.removeClass('is-active');

                if( target.panel.length ) {
                    target.panel.removeClass('is-active');
                }
            },
            _getTarget : function(element) {
                var _this = this;
                var target = {};

                target.item = $(element).parent();
                target.panel = $(_this.panel).filter('#' + $(element).attr('aria-controls'));

                return target;
            }
        };

        $(document).on('click', tab.element, function(e) {
            e.preventDefault();

            tab.open( this );
        });

        return tab;*/
    })();




    /* ==========================================================================
     * UI.modal
     * ========================================================================== */
     UI.modal = (function() {

        var UI_NAME = 'UI.modal',
            DEFAULT_DURATION = 300,
            OVERLAY_DURATION = 300,
            DEFAULT_EASING = 'swing',
            OVERLAY_EASING = 'swing';

        var Selector = {
            WRAPPER         : '.wrapper',
            MODAL           : '.modal',
            MODAL_WINDOW    : '.modal__window',
            MODAL_OPEN      : '[data-ui-modal="open"]',
            MODAL_CLOSE     : '[data-ui-modal="close"]'
        };

        var State = {
            IS_MODAL_OPEN   : 'modal-open',
            IS_OPENED       : 'is-opened',
            IS_OPENING      : 'is-opening',
            IS_CLOSED       : 'is-closed',
            IS_CLOSING      : 'is-closing',
            IS_CURRENT      : 'is-current',
            IS_ACTIVE       : 'is-active',
            IS_PREVIUS      : 'is-previus'
        };

        var Event = {
            CLICK_OPEN      : 'click.modal:open',
            CLICK_CLOSE     : 'click.modal:close',
            OPENED          : 'modal:opened',
            CLOSED          : 'modal:closed'
        };

        var Modal = function(element) {
            this.element = element;
            this.scrolltop = null;
            this.transition = getTransition();
        };

        Modal.prototype = {
            open : function(element) {

                var _this = this,
                    target = element || _this.element,
                    current = null,
                    previus = null;

                if( (/*$(target).hasClass(State.IS_CURRENT) && */$(target).hasClass(State.IS_OPENED)) || $(target).hasClass(State.IS_OPENING) || $(target).hasClass(State.IS_CLOSING) ) {
                    return;
                }

                _this.scrolltop = $(window).scrollTop();

                if( !$(document.body).hasClass(State.IS_MODAL_OPEN) ) {
                    $(document.body).addClass(State.IS_MODAL_OPEN);
                }

                document.body.appendChild( target );

                $(target)[0].offsetHeight;

                $(target).removeClass(State.IS_CLOSED);
                $(target).addClass(State.IS_OPENING);

                $(target).addClass(State.IS_ACTIVE);
                $(target).addClass(State.IS_CURRENT);
                $(target).removeClass(State.IS_PREVIUS);

                $(target).siblings(Selector.MODAL + '.' + State.IS_ACTIVE).removeClass(State.IS_CURRENT);
                $(target).siblings(Selector.MODAL + '.' + State.IS_ACTIVE).removeClass(State.IS_PREVIUS);
                $(target).siblings(Selector.MODAL + '.' + State.IS_ACTIVE).last().addClass(State.IS_PREVIUS);

                if( _this.transition ) {
                    $(target).transitionEndAfter(transitionComplete, DEFAULT_DURATION);
                }

                function transitionComplete() {
                    $(target).removeClass(State.IS_OPENING);
                    $(target).addClass(State.IS_OPENED);
                    $(target).trigger(Event.OPENED);
                }

                if( !$(target).hasClass(State.IS_OPENED) ) {
                    $(target).attr('data-scrolltop', 0);
                } else {
                    $(target).find(Selector.MODAL_WINDOW).scrollTop( $(target).attr('data-scrolltop') );
                }

                previus = $(target).siblings(Selector.MODAL + '.' + State.IS_PREVIUS)[0];

                if( $(previus).length ) {
                    $(previus).attr('data-scrolltop', $(previus).find(Selector.MODAL_WINDOW).scrollTop());
                }

                $(target).off(Event.CLICK_CLOSE).on(Event.CLICK_CLOSE, Selector.MODAL_CLOSE, function() {
                    _this.close( $(target) );
                });
            },
            close : function(element) {

                var _this = this,
                    target = element || _this.element,
                    current = null,
                    previus = null;

                if( !$(target).hasClass(State.IS_OPENED) || $(target).hasClass(State.IS_CLOSED) || $(target).hasClass(State.IS_OPENING) || $(target).hasClass(State.IS_CLOSING) ) {
                    return;
                }

                $(target).addClass(State.IS_CLOSING);
                $(target).removeClass(State.IS_OPENED);

                $(target).removeClass(State.IS_ACTIVE);
                $(target).removeClass(State.IS_CURRENT);
                $(target).removeClass(State.IS_PREVIUS);

                $(target).siblings(Selector.MODAL + '.' + State.IS_ACTIVE).last().addClass(State.IS_CURRENT);
                $(target).siblings(Selector.MODAL + '.' + State.IS_ACTIVE).removeClass(State.IS_PREVIUS);
                $(target).siblings(Selector.MODAL + '.' + State.IS_CURRENT).prevAll('.' + State.IS_ACTIVE).first().addClass(State.IS_PREVIUS);

                if( _this.transition ) {
                    $(target).transitionEndAfter(transitionComplete, DEFAULT_DURATION);
                }

                function transitionComplete() {
                    $(target).removeClass(State.IS_CLOSING);
                    $(target).addClass(State.IS_CLOSED);
                    $(target).trigger(Event.CLOSED);

                    if( !$(target).siblings(Selector.MODAL + '.' + State.IS_OPENED).length ) {
                        $(document.body).removeClass(State.IS_MODAL_OPEN);
                    }
                }

                $(target).attr('data-scrolltop', 0);

                current = $(target).siblings(Selector.MODAL + '.' + State.IS_CURRENT)[0];

                if( $(current).length ) {
                    $(current).attr('data-scrolltop', $(current).find(Selector.MODAL_WINDOW).scrollTop());
                    $(current).find(Selector.MODAL_WINDOW).scrollTop( $(current).attr('data-scrolltop') );
                } else {
                    $(window).scrollTop(_this.scrolltop);
                }
            },
        };

        $.fn.modal = function(option) {
            return this.each(function() {
                var data = $(this).data(UI_NAME),
                    method = (typeof option === 'string') && option;

                if( !data ) {
                    data = new Modal(this);
                    $(this).data(UI_NAME, data);
                }

                if( method ) {
                    data[method](this);
                }
            });
        };
     })();

})(window.jQuery, window);
