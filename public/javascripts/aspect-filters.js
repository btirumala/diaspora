/*   Copyright (c) 2010, Diaspora Inc.  This file is
 *   licensed under the Affero General Public License version 3 or later.  See
 *   the COPYRIGHT file.
 */

var AspectFilters = {
  selectedGUIDS: [],
  requests: 0,
  initialize: function(){
    AspectFilters.initializeSelectedGUIDS();
    AspectFilters.interceptAspectLinks();
    AspectFilters.interceptAspectNavLinks();

    if($("a.home_selector").parent().hasClass("selected")){
      AspectFilters.performAspectUpdate();
    }
  },
  initializeSelectedGUIDS: function(){
    $("#aspect_nav li").each(function(){
      var button = $(this),
          guid = button.attr('data-guid');

      if(guid && location.href.search("a_ids..="+guid+"(&|$)") != -1){
        button.addClass('selected');
        AspectFilters.selectedGUIDS.push(guid);
      }
    });
  },
  interceptAspectLinks: function(){
    $("a.hard_aspect_link").live("click", AspectFilters.aspectLinkClicked);
  },
  aspectLinkClicked: function(e){
    var link = $(this);
    e.preventDefault();
    if( !link.hasClass('aspect_selector') ){
      AspectFilters.switchToAspect(link);
    }

    $('html, body').animate({scrollTop:0}, 'fast');
  },
  switchToAspect: function(aspectLi){
    AspectFilters.requests++;

    var guid = aspectLi.attr('data-guid');

    // select correct aspect in filter list & deselect others
    $("#aspect_nav li").removeClass('selected');
    link.addClass('selected');

    AspectFilters.fadeOut();

    AspectFilters.performAjax( aspectLi.attr('href'));
  },
  interceptAspectNavLinks: function(){
    $("#aspect_nav a.aspect_selector").click(function(e){
      e.preventDefault();

      AspectFilters.requests++;

      // loading animation
      AspectFilters.fadeOut();

      // filtering //////////////////////
      var $this = $(this),
          listElement = $this.parent(),
          guid = listElement.attr('data-guid'),
          homeListElement = $("#aspect_nav a.home_selector").parent();

      if( listElement.hasClass('selected') ){
        // remove filter
        var idx = AspectFilters.selectedGUIDS.indexOf( guid );
        if( idx != -1 ){
          AspectFilters.selectedGUIDS.splice(idx,1);
        }
        listElement.removeClass('selected');

        if(AspectFilters.selectedGUIDS.length == 0){
          homeListElement.addClass('selected');
        }

      } else {
        // append filter
        if(AspectFilters.selectedGUIDS.indexOf( guid == 1)){
          AspectFilters.selectedGUIDS.push( guid );
        }
        listElement.addClass('selected');

        homeListElement.removeClass('selected');
      }

       AspectFilters.performAjax(AspectFilters.generateURL());
    });
  },
  generateURL: function(){
    var baseURL = location.href.split("?")[0];

    // generate new url
    baseURL = baseURL.replace('#','');
    baseURL += '?';
    for(i=0; i < AspectFilters.selectedGUIDS.length; i++){
      baseURL += 'a_ids[]='+ AspectFilters.selectedGUIDS[i] +'&';
    }

    if(!$("#publisher").hasClass("closed")) {
      // open publisher
      baseURL += "op=true";
    } else {
      // slice last '&'
      baseURL = baseURL.slice(0,baseURL.length-1);
    }
    return baseURL;
  },
  performAspectUpdate: function(){
    // update the open aspects in the user
    updateURL = "/user";
    updateURL += '?';
    if(AspectFilters.selectedGUIDS.length == 0){
      updateURL += 'user[a_ids][]=home';
    } else {
      for(i=0; i < AspectFilters.selectedGUIDS.length; i++){
        updateURL += 'user[a_ids][]='+ AspectFilters.selectedGUIDS[i] +'&';
      }
    }

    $.ajax({
      url : updateURL,
      type: "PUT",
      });
  },
  performAjax: function(newURL) {
    var post = $("#publisher textarea").val(),
        photos = {};

    //pass photos
    $('#photodropzone img').each(function(){
      var img = $(this);
      var guid = img.attr('data-id');
      var url = img.attr('src');
      photos[guid] = url;
    });

    // set url
    // some browsers (Firefox for example) don't support pushState
    if (typeof(history.pushState) == 'function') {
      history.pushState(null, document.title, newURL);
    }

    $.ajax({
      url : newURL,
      dataType : 'script',
      success  : function(data){
        AspectFilters.requests--;
        // fill in publisher
        // (not cached because this element changes)

        var textarea = $("#publisher textarea");
        var photozone = $('#photodropzone')

        if( post != "" ) {
          textarea.val(post);
          textarea.focus();
        }

        var photos_html = "";
        for(var key in photos){
          $("#publisher textarea").addClass("with_attachments");
          photos_html = photos_html + "<li style='position:relative;'> " + ("<img src='" + photos[key] +"' data-id='" + key + "'>") +  "</li>";
        };

        // reinit listeners on stream
        photozone.html(photos_html);
        Stream.initialize();
        InfiniteScroll.initialize();

        Publisher.initialize();

        // fade contents back in
        if(AspectFilters.requests == 0){
          AspectFilters.fadeIn();
          AspectFilters.performAspectUpdate();
        }
      }
    });
  },
  fadeIn: function(){
    $("#aspect_stream_container").fadeTo(100, 1);
    $("#aspect_contact_pictures").fadeTo(100, 1);
  },
  fadeOut: function(){
    $("#aspect_stream_container").fadeTo(100, 0.4);
    $("#aspect_contact_pictures").fadeTo(100, 0.4);
  }
}
$(document).ready(function(){
  AspectFilters.initialize();
});
