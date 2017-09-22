'use strict';

require("babel-polyfill"); // Makes Map available for all browsers

var factory = require("./lutinsPresentationGame/CtrlFactory.js");
var $ = require('jquery-slim');
// require('gsap');
require('gsap/ScrollToPlugin');
var ScrollReveal = require('scrollreveal');
var TweenMax = require('gsap/TweenMax');
var bodymovin = require('./_bodymovin.js');

$(function () {
    window.scrollReveal = ScrollReveal({ reset: true, scale: 1, easing: 'ease-in-out',  distance: '100px', viewFactor: 0.3 });
    window.requestAnimFrame = require('./requestAnimFrame.js');
    var throttle = require('./throttle.js');
    var scrollTo = require('./scrollTo.js');
    var noTransition = require('./noTransition.js');
    var body = $('body');
    var html = $('html');
    var header = $('#header');
    // window.outerWidth returns the window width including the scroll, but it's not working with $(window).outerWidth
    var windowWidth = window.outerWidth, windowHeight = $(window).height();
    var stats = $('#statsHome');
    var breakpoint = {};
    var firstM = false;
    var cordeParams = {
        container: document.getElementById('bodymovin'),
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: 'anim/lutin-corde.json'
    };
    var lutinCorde;

    // isMobile.any ? body.addClass('is-mobile') : body.addClass('is-desktop');


    function loadControllers () {
        factory.loadControllers(document.body);
    }

    function isIE(userAgent) {
      userAgent = userAgent || navigator.userAgent;
      return userAgent.indexOf("MSIE ") > -1 || userAgent.indexOf("Trident/") > -1 || userAgent.indexOf("Edge/") > -1;
    }

    function menuOnScroll() {
        if ($(document).scrollTop() > 80) {
            $('#header, #topHeader').addClass('isFixed');
            if (!firstM) {
                header.delay(100).queue(function () { $(this).removeClass('no-transition').dequeue(); });
                firstM = !firstM;
            }
        } else {
            $('#header, #topHeader').removeClass('isFixed no-transition');
        }
    }

    // Slider statistiques sur la home
    function sliderStats() {
        if (!body.hasClass('home')) return;
        var tempo = 0.5;
        var stat, newElt;
        function reset() {
            TweenMax.to(stat, tempo, { y: -122, delay: 2 });
            TweenMax.to(stat[0], tempo, { opacity: 0, ease: Power2.easeOut, delay: 2 });
            TweenMax.to(stat[1], tempo, { opacity: 1, ease: Power2.easeOut, delay: 2 });
            TweenMax.to(stat[2], tempo, { opacity: 0.8, ease: Power2.easeOut, delay: 2 });
            TweenMax.to(stat[3], tempo, { opacity: 0.5, ease: Power2.easeOut, delay: 2 });
            TweenMax.to(stat[4], tempo, { opacity: 0.3, ease: Power2.easeOut, delay: 2, onComplete: function(){
                $(stat[0]).remove();
                stat = stats.find('li');
                TweenMax.set(stat, { y: 0 });
                newElt = $(stat[0]).clone().appendTo(stats);
                TweenMax.set(newElt, { opacity: 0 });
                stat = stats.find('li');
                reset();
            }});
        }
        stat = stats.find('li');
        $(stat[0]).clone().appendTo(stats);
        TweenMax.set(stat[0], { opacity: 1 });
        TweenMax.set(stat[1], { opacity: 0.8 });
        TweenMax.set(stat[2], { opacity: 0.5 });
        TweenMax.set(stat[3], { opacity: 0.3 });
        stat = stats.find('li');
        reset();
    }

    function resizeHandler() {
        breakpoint.refreshValue();
        menuOnScroll();
        windowWidth = window.outerWidth;
        windowHeight = $(window).height();
        if (windowWidth <= 1025 && body.hasClass('game')) {
            html.removeClass('js').addClass('no-js');
        } else if (body.hasClass('game')) {
            html.removeClass('no-js').addClass('js');
        }
    }

    function scrollHandler() {
        menuOnScroll();
    }


    // Add class js to body
    menuOnScroll();
    if (isIE()) body.addClass('ie');
    breakpoint.refreshValue = function () {
        this.value = window.getComputedStyle(document.querySelector('body'), ':before').getPropertyValue('content').replace(/\"/g, '');
    };
    
    if ($('#footer').length ) {
        lutinCorde = bodymovin.loadAnimation(cordeParams);
    }



    scrollTo($('#btnToAL'));
    loadControllers();
    sliderStats();

    // No transition on resize
    noTransition(header);

    if (windowWidth <= 1025 && body.hasClass('game')) {
        html.removeClass('js').addClass('no-js');
    } else if (body.hasClass('game')) {
        html.removeClass('no-js').addClass('js');
    }

    // SCROLLREVEAL
    if($('.srClient').length){
        $('.srClient').each(function(i){
            scrollReveal.reveal($(this)[0], {duration: 200, delay: i*100, origin: 'bottom'});
        });
    }
    if($('.srLogo').length){
        $('.srLogo').each(function(){
            scrollReveal.reveal($(this)[0], {duration: 200, delay: Math.floor(Math.random() * 3)*100, origin: 'bottom'});
        });
    }
    if($('.srH1').length){
        $('.srH1').each(function(){
            scrollReveal.reveal($(this)[0], {duration: 200, origin: 'bottom'});
        });
    }
    if($('.srMetier').length){
        $('.srMetier').each(function(){
            scrollReveal.reveal($(this)[0], {duration: 200, origin: 'bottom'});
        });
    }
    if($('.srSection').length){
        $('.srSection').each(function(){
            scrollReveal.reveal($(this)[0], {duration: 200, origin: 'bottom'});
        });
    }


    // toggle du menu principal avec le bouton hamburger
    $('#menuToggle, #overlayMenu').on('click', function () {
        $('#main-menu-container').toggleClass('active');
        body.toggleClass('has-ovh');
        $('#menuToggle').toggleClass('is-active');
    });

    // retour en haut de page
    $('#backToTop').on('click', function (e) {
        e.preventDefault();
        lutinCorde.play();
        TweenMax.to(window, 1, {
            scrollTo: { y: 0, autoKill: false }, delay: 0.45, ease:Power2.easeOut, onComplete: function () {
                lutinCorde.goToAndStop(0);
        }});
    });

    $(window).on('resize', throttle(function(){
        requestAnimFrame(resizeHandler);
    }, 60)).on('load', function () {

    });
    $(document).on('scroll', throttle(function(){
        requestAnimFrame(scrollHandler);
    }, 60));
});
