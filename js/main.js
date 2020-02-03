$(window).load(function() {
        //show();
        //$.localScroll({
        //        duration:1600
        //});
        //$('.ux-slider').unslider();
        //var s = skrollr.init({});
        mixpanel.track('Homepage Loaded')
        console.log('home loaded');
        
        // init bot
        //Smooch.init({ appToken: '5nawp8t2ljdh9jzp819rk8h96' });
});

function show() {
        //$('.loadscreen').hide();
        //$('.story').fadeIn();
};
//if($.contains(document.body, document.getElementById('skrollr-body')) ){
//        
//   var elements = document.querySelectorAll( 'article a' );
//   GifLinks( elements, {preload: true} );
//};


//var tangle = new Tangle(document, {
//    initialize: function () {
//	this.cigarettesPerDay = 8;
//	this.pricePerPack = 5;
//	this.cigarettesPerPack = 19;
//	this.packsPerYear = 0;
//	this.savedPerYear = 0;
//	this.priceOfBoat = 45000;
//	this.years = 0;
//	this.yearsMinusOne = 0;
//    },
//    update:     function () {
//	this.savedPerYear = ( this.pricePerPack / this.cigarettesPerPack ) * this.cigarettesPerDay * 365;
//	this.packsPerYear = ( this.cigarettesPerDay / this.cigarettesPerPack ) * 365;
//	this.years = this.priceOfBoat / this.savedPerYear;
//	this.yearsMinusOne = this.years - 1;
//	$('.cigarette').remove();
//	for (i = 0; i < this.cigarettesPerPack; i++) {
//	    $('.pack').append('<img class="cigarette" src="img/cigarette.png"/>');
//	}
//	$('.cigs-overlay').css('width', this.cigarettesPerDay*20);
//	$('.cigarette-line-one').css('width', this.cigarettesPerPack*20+8);
//	$('.cigarette-line-two').css('width', this.cigarettesPerDay*20+5);
//	if(this.cigarettesPerDay <= this.cigarettesPerPack){
//	    
//	} else {
//	    for (i = this.cigarettesPerPack; i < this.cigarettesPerDay; i++) {
//		$('.pack').append('<img class="cigarette" src="img/cigarette.png"/>');
//	    }
//	}
//	
//    }
//});
//var moveMeXPos = $('.slider-left').outerWidth() - $('.move-me').outerWidth()/2;
//$('.move-me').css('left', moveMeXPos);
$( ".slider-wrapper" ).mousemove(function( e ) {
        var offX  = (e.offsetX || e.clientX - $(e.target).offset().left);
        $(".slider-left, .slider-left-small-1, .slider-left-small-2").css("width", offX);
        //$('.move-me').css('left', offX);
	$('.move-me .move-me-small').fadeOut('slow');
});

$( document ).on ( "vmousemove", ".slider-wrapper", function(e) {
	var offX  = (e.offsetX || e.clientX - $(e.target).offset().left);
	$(".slider-left, .slider-left-small-1, .slider-left-small-2").css("width", offX);
	//$('.move-me').css('left', offX);
	e.preventDefault();
	//TODO disable up-downwards swiping dragging
	$('.move-me .move-me-small').fadeOut('slow');
});

$( ".slider-wrapper" ).mouseover(function( e ) {
        $('.move-me, .move-me-small').fadeOut('slow');
});