var failingStudentArray = [];
var currentStudent = 0;

//Add new link on top:
function addLink(status){
	switch(status){
		case "loading":
			var new_li = document.createElement('li'),
				new_a = document.createElement('a'),
				new_img = document.createElement("img");
			new_img.src = chrome.extension.getURL('loading.gif');
			new_li.className = "email_parents_link";
			new_a.appendChild(new_img);
			new_li.appendChild(new_a);
			$('#listMenuRoot').append(new_li);
			break;
			
		case "ready":
			var new_a = document.createElement('a'),
				new_img = document.createElement("img");
			new_img.src = chrome.extension.getURL('email.png');
			new_a.className = "fancyFrameLink";
			new_a.setAttribute('href',"#emailParentsDialogue");
			new_a.appendChild(new_img);
			new_a.appendChild( document.createTextNode(" Email Parents") );
			$('.email_parents_link').empty();
			$('.email_parents_link').append(new_a);
			break;
	}
}

function sendNextEmail(studentid){
	var body = $('#previewarea').val();
	var email = failingStudentArray[studentid].parentemails;
	var subject = failingStudentArray[studentid].firstname
				+ " " + failingStudentArray[studentid].lastname
				+ " - " + failingStudentArray[studentid].coursename;
	var bcc = "";
	if($('#bcccheckbox').is(':checked')){
		bcc = "bcc=studentfile@spcpa.org&";
	}
	var link = "mailto:" + email + "?" + bcc + "subject=" 
			+ encodeURI(subject) + "&body=" + encodeURI(body);
	var myWindow = window.open(link); // Open up email.
	setTimeout(function(){
		myWindow.close();
	}, 2000);
}

function updatePreviewTextbox(){
	studentid = currentStudent;
	var currentText = $('#editablearea').val();
	var translate = (failingStudentArray[studentid].gender == 'M') ? {
		"{{student_first}}": failingStudentArray[studentid].firstname,
		"{{student_last}}": failingStudentArray[studentid].lastname,
		"{{letter_grade}}": failingStudentArray[studentid].letterGrade,
		"{{percent}}": failingStudentArray[studentid].percent,
		"{{he_she}}": "he", 
		"{{He_She}}": "He",
		"{{him_her}}": "him",
		"{{his_her}}": "his"
	} : { // if female:
		"{{student_first}}": failingStudentArray[studentid].firstname,
		"{{student_last}}": failingStudentArray[studentid].lastname,
		"{{letter_grade}}": failingStudentArray[studentid].letterGrade,
		"{{percent}}": failingStudentArray[studentid].percent,
		"{{he_she}}": "she", 
		"{{He_She}}": "She",
		"{{him_her}}": "her",
		"{{his_her}}": "her"
	};
	
	for( var key in translate ){
		currentText = currentText.replace(new RegExp(key, "g"), translate[key]);
	}
	$('#previewarea').val(currentText);
}

//Insert tags into text editor.
function insertAtCaret(areaId,text) {
	var txtarea = document.getElementById(areaId);
	var scrollPos = txtarea.scrollTop;
	var strPos = 0;
	var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ? 
		"ff" : (document.selection ? "ie" : false ) );
	if (br == "ie") { 
		txtarea.focus();
		var range = document.selection.createRange();
		range.moveStart ('character', -txtarea.value.length);
		strPos = range.text.length;
	}
	else if (br == "ff") strPos = txtarea.selectionStart;
	
	var front = (txtarea.value).substring(0,strPos);  
	var back = (txtarea.value).substring(strPos,txtarea.value.length); 
	txtarea.value=front+text+back;
	strPos = strPos + text.length;
	if (br == "ie") { 
		txtarea.focus();
		var range = document.selection.createRange();
		range.moveStart ('character', -txtarea.value.length);
		range.moveStart ('character', strPos);
		range.moveEnd ('character', 0);
		range.select();
	}
	else if (br == "ff") {
		txtarea.selectionStart = strPos;
		txtarea.selectionEnd = strPos;
		txtarea.focus();
	}
	txtarea.scrollTop = scrollPos;
}

function addTextToEditor(text){
	insertAtCaret('editablearea', text);
	updatePreviewTextbox();
}

function highlightAppropriateRow(){
	$("tr").removeClass();
	$("tr:even").addClass("shadedrow");
	var nthchild = (currentStudent+2);
	$('.StudentList tr:nth-child(' + nthchild + ')').removeClass();
	$('.StudentList tr:nth-child(' + nthchild + ')').addClass('highlightrow');
}

function drawEmailInterface(){
	$('body').empty();
	
	$('body').append('<table><tr><td id="buttonarea"></td><td>Edit your eMail:<br><textarea cols="70" rows="15" placeholder="Edit your email here" id="editablearea" /></td><td>Preview:<br><textarea cols="70" rows="15" placeholder="This is a preview of your message" id="previewarea" readonly /></td></tr></table><hr>');

	$('#editablearea').bind('input propertychange', function() {
		updatePreviewTextbox();
	});
	
	//Create new empty table
	$('body').append(failingStudentArray.length + " students found:<br>");
	var new_table = document.createElement('table');
	new_table.className="StudentList";
	var newtable2 = document.createElement('table');
	var newtr = document.createElement('tr');
	var newtd = document.createElement('td');
	newtd.appendChild(new_table);
	newtr.className = "emaillisttr";
	newtr.appendChild(newtd);
	newtable2.appendChild(newtr);
	$('body').append(newtable2);
	$(".emaillisttr").append('<input type="checkbox" id="bcccheckbox" checked>BCC studentfile@spcpa.org?<br><td><button id="sendmailbutton">Send Next Email</button></td>');
	
	//Populate Table:
	$('.StudentList').append("<tr><th>First</th><th>Last</th><th>Gender</th><th>Letter Grade</th><th>Percent</th><th>Course</th><th>Parent Emails</th></tr>");
	var length = failingStudentArray.length;
	for(var i = 0; i < length; i++){
		var newline = "<tr>";
		newline += "<td>" + failingStudentArray[i].firstname + "</td>";
		newline += "<td>" + failingStudentArray[i].lastname + "</td>";
		newline += "<td>" + failingStudentArray[i].gender + "</td>";
		newline += "<td>" + failingStudentArray[i].letterGrade + "</td>";
		newline += "<td>" + failingStudentArray[i].percent + "</td>";
		newline += "<td>" + failingStudentArray[i].coursename + "</td>";
		newline += "<td>" + failingStudentArray[i].parentemails + "</td>";
		newline += "</tr>";
		$('.StudentList').append(newline);
	}
	highlightAppropriateRow();
	
	//Add buttons:
	var buttons = {
		"First Name" : "{{student_first}}",
		"Last Name" : "{{student_last}}",
		"Letter Grade" : "{{letter_grade}}",
		"Percent Grade" : "{{percent}}",
		"he / she" : "{{he_she}}",
		"He / She" : "{{He_She}}",
		"him / her" : "{{him_her}}",
		"his / her" : "{{his_her}}"
	}
	
	//Generate side buttons:
	for (var key in buttons){
		$('#buttonarea').append('<button class="textadder" value="' + buttons[key] + '">' + key + '</button><br>');
	}
	
	//Add button listeners
	$('.textadder').click(function() {
		addTextToEditor($(this).val());
	});
	
	$('#sendmailbutton').click(function(){
		sendNextEmail(currentStudent);
		currentStudent++;
		if(currentStudent == failingStudentArray.length){
			$(this).hide();
			$(this).parent().append("You're done with emails!  Time for glass of wine!");
		} else {
			highlightAppropriateRow();
			updatePreviewTextbox();
		}
	});
	
	$('td').css({'vertical-align': 'top', 'text-align' : 'left'});
	
}

function fetchURL(geturl){
	$.ajax({
		type: "POST",
		async: false,
		url: geturl,
		error: function (XMLHttpRequest, textStatus, errorThrown) { 
			console.log('error');
		},
		success: function (data) {
			response = data;
		}
	});
	return response;
}

function getDialogueHTML(){
	var response = "";
	var retval = '<img src="' + chrome.extension.getURL('email.png') + '"> Email Parents <br>';
	retval += "Please select the courses for which you would like to send emails:<br><br>";
	$.ajax({
		type: "POST",
		async: false,
		url: "/toas/apps/gradebook/grades/menu.asp",
		error: function (XMLHttpRequest, textStatus, errorThrown) { 
			console.log('error');
		},
		success: function (data) {
			response = data;
		}
	});
	
	$( ".class", response ).each(function( index ) {
	  var coursename = $(this).text(),
		href = $(this).attr("href"),
		classlink = href.substr(href.search("ClassLink=")+10,6),
		course = href.substr(href.search("Course=")+7,4),
		section = href.substr(href.search("Section=")+8,3),
		period = href.substr(href.search("Period=")+7,2)
		dataurl = $( "select", $(this).parent().siblings("td:nth-child(6)")).children("option:nth-child(3)").attr('value');		
	  retval += '<label for="' + classlink + '"><input type="checkbox" class="emailParentsCourseSelector" value="'
				+ classlink + '"' + 'id="' + classlink + '" data-url="' + dataurl + '" data-coursename="' + coursename + '">' 
				+ coursename + ' ('
				+ 'Section: ' + section + ' / '
				+ 'Period: ' + period + ' / '
				+ 'Course ID: ' + course + ')</label><br>';
	});	
		
	retval += '<br><a href="#" class="emailparentsbutton">Email Parents</a>'

	return retval;
}

function beginEmailProcess(){
	$.fancybox.close();
	$.fancybox.open( { href : "#loadingscreen" } );
	setTimeout(function(){gatherData()},3000);
}

function findEmailAddresses(StrObj) {
	var separateEmailsBy = "; ";
	var email = "<none>"; // if no match, use this
	var emailsArray = StrObj.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
	if (emailsArray) {
		email = "";
		for (var i = 0; i < emailsArray.length; i+=2) {
			if (i != 0) email += separateEmailsBy;
			email += emailsArray[i];
		}
	}
	return email;
}

function gatherData(){
	$('.emailParentsCourseSelector').each(function(index){
		if($(this).prop('checked')) {// check box is checked
			// ***************
			// Gather data for each course:
			
			var url = $(this).attr('data-url');
			var coursename = $(this).attr('data-coursename');
			coursehtml = fetchURL(url); // Big 'ol string containing "edit scores for multiple..."
			var studentArray = $("tr[id^='row']", coursehtml);
			
			for( i=0; i < studentArray.length; i++){
				var singleLine = studentArray[i];// Parse through students
				var letterGrade = $(singleLine).children()[2].innerHTML;
				if(letterGrade == 'F' || letterGrade == 'D-' || letterGrade == 'D' || letterGrade == 'D+') {// Less than 'C' grade
					var student = new Object();
					student.percent = $(singleLine).children()[1].innerHTML;
					student.percent = student.percent.replace('%','');
					student.letterGrade = $(singleLine).children()[2].innerHTML;
					firstcolumn = $(singleLine).children()[0];
					fullname = $("a:nth-of-type(1)", firstcolumn)[0].innerHTML;
					restofname = fullname.substring(fullname.search(", ")+2);
					student.lastname = fullname.substring(0, fullname.search(", "));
					if(restofname.search(" ") == -1){ // No middle name{
						student.firstname = restofname;
					} else {
						student.firstname = restofname.substring(0, restofname.search(" "));
					}
					student.parentemails = "";
					student.coursename = coursename;
					student.url = $("a:nth-of-type(2)", firstcolumn).attr('href');
					failingStudentArray.push(student);
				}
			}
		}
	});
	
	// Done Getting Course data
	// *********************************
	// On to student data:
	var length = failingStudentArray.length;
	for(var i = 0; i < length; i++){
		fetchURL(failingStudentArray[i].url); // Validate student information
		var contactpage = fetchURL('/toas/globalassets/includes/StudentLink/student_contact.asp'); // Gather student data.
		
		//Use real expressions to extract emails from page:
		failingStudentArray[i].parentemails = findEmailAddresses(contactpage);
		
		// Get and save gender:
		failingStudentArray[i].gender = $(".rtpad", contactpage)[2].innerHTML.substring($(".rtpad", contactpage)[2].innerHTML.length-1);
	}
			
	$.fancybox.close(); // Clear Out Body
	drawEmailInterface();
}

function addDialogueHTML(){
	var dialogueHTML = getDialogueHTML();
	$('#emailParentsDialogue').html( dialogueHTML );
}

$(document).ready( function() {
		addLink("loading");
		
		// Create fancybox emailParentsDialogue div (hidden at first)
		$('body').append('<div id="emailParentsDialogue" style="display:none;width:500px;">test</div>');
		$('body').append('<div id="loadingscreen" style="display:none;width:500px;"><img src="' + chrome.extension.getURL('loadingbar.gif') + '"><br>Gathering data for students under 70%.  This may take a while (2+ minutes).</div>');
		addLink("ready");
		
		$('.fancyFrameLink').fancybox({
			closeClick	: false,
			openEffect	: 'fade',
			closeEffect	: 'fade'
		});
		
		$('.fancyFrameLink').click(function(){
			addDialogueHTML();
			$('.emailparentsbutton').click(function(){
			beginEmailProcess();
		});
		});
});
