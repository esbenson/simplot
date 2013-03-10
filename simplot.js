/* SIMPLOT
   Copyright (C) Etienne Benson
		   after Donald Blair Siniff, PROGRAM SIMPLOT, 1967 

	Released under GPL3
	
	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.



	note - "clog" is alias for "console.log"

*/


var timeoutID = null;
window.onload = main;

// ===========================================================
//  -------- main  ----------------------------------------
function main () {
   
    var p = getParams();    // read in distributions and default params from file
    p.plot = initializePlot("plotcanvas", p.background); // a canvas on the element with "plotcanvas" id, background color
    initializeControls(p);    // set up event handlers for controls           

    return;
}

// =============================================================
// -------- clear plot --------------------------------
function clearPlot (params) {        
        //clog(params.background);
        params.plot.restore();
        params.plot.fillStyle = params.background;
        params.plot.fillRect(0,0,params.plot.canvas.width,params.plot.canvas.height);	
		return;
}

// =============================================================
// -------- initialize controls --------------------------------
function initializeControls(params) {
    // run     and stop and progress
    $("#run").on('click', params, runSimulation);
    $("#stopblock").css("visibility", "visible");
    $("#stop").on('click', function () {
    				clearInterval(timeoutID);
					});
	$("#progressbar").progressbar({value:0, max:500});
    
    // begin-with-move radio
    $("input[type=radio][name=beginperiod]").on('change', function() { 
        if ($(this).val() == "move")
            params.begin_with_move = true;
        else   
            params.begin_with_move = false; 
        });

    // dist multiple radio
    $("input[type=radio][name=distmultiple]").on('change', function() { 
        if ($(this).val() == "25feet")
            params.dist_multiple = 25;
        else   
            params.dist_multiple = 50; 
		labelDistrs(params);
        });
 
    // map scale radio
    $("input[type=radio][name=mapscale]").on('change', function() { 
            switch($(this).val()) {
                case ".076": 
                        params.map_scale = .076;
                        break;
                case ".25": 
                     params.map_scale = .25;
                     break;
                case ".50": 
                      params.map_scale = .50;
                      break;
                case "1.0": 
                    params.map_scale = 1.0;
                    break;
            } 
        });

	// show advanced
	$("#showadvanced").click(function() {
	if ($("#showadvanced").text() == "Advanced options <<") {
		$("#showadvanced").text("Advanced options >>");
		$("#advancedoptions").slideUp();
	} else { 		
		$("#showadvanced").text("Advanced options <<");
		$("#advancedoptions").slideDown();
	}});

	// color picker
	$("#background").change(function (){ params.background=$(this).val();
					//clog(params.background);
		            plotSimulation(params);
		});
	$("#foreground").change(function (){ params.foreground=$(this).val();
			  //clog(params.foreground);
    	      plotSimulation(params);
		});

	
	// distribution graphs
	var display_name = ""
	var name = ""
	for (d in params.distr) {
		name = params.distr[d].name; 
		display_name = name.replace("mu", "&mu;")
									.replace("pi", "&pi;")
									.replace("kappa", "&kappa;");
		$("#distribselect").append("<option value=" + "\"" + name 
									+ "\">" + display_name + "</option>");
	}
	$("#distribselect").change(function () { 
								params.distr_type = $(this).val();
								//clog(params.distr_type);
								graphDistrs(params);
								});
	graphDistrs(params);

	// show/hide statistics
	$("#showstatistics").click(function() {
		if ($("#showstatistics").text() == "Statistics <<") {
			$("#showstatistics").text("Statistics >>");
			$("#statistics").slideUp();
	} else { 		
		$("#showstatistics").text("Statistics <<");
		$("#statistics").slideDown();
	}});

	// show/hide distributions
	labelDistrs(params);	
	$("#distributiongraphs").hide();
	$("#showdistribs").click(function() {
	if ($("#showdistribs").text() == "Probability distributions <<") {
		$("#showdistribs").text("Probability distributions >>");
		$("#distributiongraphs").slideUp();
	} else { 		
		$("#showdistribs").text("Probability distributions <<");
		$("#distributiongraphs").slideDown();
	}});

	 // linetype
    $("input[type=radio][name=linetype]").on('change', function() { 
            params.line_style = $(this).val();
            plotSimulation(params);
        });

    // plotsize
    $("input[type=radio][name=plotsize]").on('change', function() { 
            params.plotsize = $(this).val();
            switch(params.plotsize) {
                case '1200x1200': 
                    $("#plotcanvas").width(1200).height(1200);
                    $("#plotcanvas").attr("width", 1200).attr("height", 1200);
                    $("#plotframe").width(1200).height(1200);
                    break;
                case '900x900': 
                    $("#plotcanvas").width(900).height(900);
                    $("#plotcanvas").attr("width", 900).attr("height", 900);
                    $("#plotframe").width(900).height(900);
	            	break;
                case '600x600': 
                    $("#plotcanvas").width(600).height(600);
                    $("#plotcanvas").attr("width", 600).attr("height", 600);
                    $("#plotframe").width(600).height(600);
                    break;
                case '300x300': 
                    $("#plotcanvas").width(300).height(300);
                    $("#plotcanvas").attr("width", 300).attr("height", 300);
                    $("#plotframe").width(300).height(300);
                    break;
            }             
            if ((params.coords != null) && (params.coords.x.length > 0))
                plotSimulation(params);
            else
                clearPlot(params); // clear the canvas
        });

    // plotspeed
    $("input[type=radio][name=plotspeed]").on('change', function() { 
            switch($(this).val()) {
                case 'instant':
                    params.plotting_delay = 0;  // milliseconds
                     $("#stopblock").css("visibility", "hidden");
                    break;
                case 'fast': 
                    params.plotting_delay = 1;  
                    break;
                case 'medium': 
                    params.plotting_delay = 20; 
                    break;
                case 'slow': 
                    params.plotting_delay = 100; 
                    break;
            }   
            //clog("delay " + params.plotting_delay);          
            if ((params.coords != null) && (params.coords.x.length > 0)) 
                plotSimulation(params);
            });
       
               
    // starting coordinates and time between
    $("input[type=text][name=x_start]").on('change', function() { 
    		params.x_start=parseFloat($(this).val());});
    $("input[type=text][name=y_start]").on('change', function() { 
    		params.y_start=parseFloat($(this).val());});
    $("input[type=text][name=minutesbetween]").on('change', function() { 
    		params.time_between_positions=parseFloat($(this).val());}); 

    // num positions    
    $("input[type=text][name=maxpositions]").on('change', function() { 
    		params.positions_to_run=parseInt($(this).val());});
    $("input[type=text][name=maxpositions]").on('keypress', function (event) {
        if (event.which == 13) { // if enter
			params.positions_to_run=parseInt($(this).val());
            event.data = params;
            clearInterval(timeoutID);
            runSimulation(event);
        }
    });
       
    // showorigin
    $("input[type=checkbox][name=showorigin]").on('change', function() { 
            params.show_origin = !params.show_origin;
            if (params.coords != null) 
                plotSimulation(params);
            else
				clearPlot(params);
        });
        
    // showorigin
    $("input[type=checkbox][name=showscale]").on('change', function() { 
            params.show_scale = !params.show_scale;
            if ((params.coords != null) || (params.coords.x.length > 0)) 
                plotSimulation(params);
            else
				clearPlot(params);
        });   
     
    return;
}

// ============================================================
// -------- graph distributions --------------------------------
function graphDistrs(params) {
	//clog(params.distr_type);
	$("#dist_distr").sparkline(params.distr[params.distr_type].dist, {
											type:"bar",barColor:"gray",zeroColor:"gray",
											chartRangeMin:"0" , chartRangeMax:".4",
											height:"30px"});
	$("#move_distr").sparkline(params.distr[params.distr_type].move, {
											type:"bar",barColor:"gray",zeroColor:"gray",
											chartRangeMin:"0", chartRangeMax:".4",
											height:"30px"});
	$("#ang_distr").sparkline(params.distr[params.distr_type].ang, {
											type:"bar",barColor:"gray",zeroColor:"gray",
											chartRangeMin:"0", chartRangeMax:".4",
											height:"30px", barWidth:"3px"});
	$("#rest_distr").sparkline(params.distr[params.distr_type].rest, {
											type:"bar",barColor:"gray",zeroColor:"gray",
											chartRangeMin:"0", chartRangeMax:".4",
											height:"30px"});
	return;

}

// ============================================================
// -------- label distributions --------------------------------
function labelDistrs(params) {
	$("#move_label").html("movement<br/>(" 
				+ (30+15) + "-" + (params.distr[params.distr_type].move.length *30+15) + " mins)");
	$("#rest_label").html("rest<br/>(" 
				+ (30+15) + "-" + (params.distr[params.distr_type].rest.length *30+15) + " mins)");
    $("#dist_label").html("distance<br/>(" 
				+ (params.dist_multiple) + "-" 
				+ (params.distr[params.distr_type].dist.length * params.dist_multiple 
				    + (params.distr[params.distr_type].dist.length-1) * params.dist_multiple) 
				+ " feet)");
 	$("#ang_label").html("angle<br/>(" 
				+ "5-" 
				+ ((params.distr[params.distr_type].ang.length * 5)
					+ ((params.distr[params.distr_type].ang.length-1)*5)) 
				+ " degrees)");
	return;
	}
				
// ============================================================
// -------- run simulation --------------------------------
function runSimulation(e) {
    //clog("in run");
    var params = e.data;
    var dist = 0; // R ... distance to move
    var angle = 0; // AN ... current angle of turn
    var mins_remaining = 0; // MIN 
    var position = 0; // K ... but indexed from 0   
    var coords = {x:[], y:[]} // XA, YA ... x and y coordinates, in miles
    var move_period=params.begin_with_move;
    var rest_positions = 0;
    var cumulative_dist = 0;
    
    // clear coordinates and set initial position
    coords.x.length = 0;
    coords.y.length = 0;
    coords.x[0] = params.x_start;
    coords.y[0] = params.y_start;    
    position += 1;    

    //$("#stop").hide();
    //$("#stopblock").css("visibility", "hidden");
    $("#message").html("&nbsp;");
	$("#progressbar").progressbar("option", "value", 0);    	
	//clog(params.distr[params.distr_type].move);

    while (position < params.positions_to_run) {
        // clog("position" + position);
        if (move_period) { // move period
            // clog("start move period");
            mins_remaining = randDistrBin(params.distr[params.distr_type].move) * 30 + 15; // minimum move period 45 minutes, increment by 30 minutes
            // clog("mins_remaining " + mins_remaining);
            while ((mins_remaining > 0) && (position < params.positions_to_run)) {
                // calc angle and distance to move
                angle = calcAngle(params.distr[params.distr_type].ang, 
                				angle); // calculate new angle of move (in degrees)
                dist = calcDist(params.distr[params.distr_type].dist, 
                				params.dist_multiple); // calculate distance of move (in miles)
				cumulative_dist += dist;
                // clog("angle " + angle + " dist " + dist);
                // calculate new coordinates (in miles)
                coords.x[position] = coords.x[position - 1] + dist 
                						* Math.cos(angle / (180/Math.PI)); // convert angle to radians
                coords.y[position] = coords.y[position - 1] + dist 
                						* Math.sin(angle / (180/Math.PI));
                //clog("coords x " + coords.x[position] + "   y " + coords.y[position] + "  dist " + dist + "  angle " + angle);
                position++;
                mins_remaining = mins_remaining - params.time_between_positions;      
            }
            move_period = false;
        } else { // rest period
            // clog("start rest period");
            mins_remaining = randDistrBin(params.distr[params.distr_type].rest) * 30 + 15;
            while ((mins_remaining > 0) && (position < params.positions_to_run)) {
                coords.x[position] = coords.x[position - 1];
                coords.y[position] = coords.y[position - 1];
                //clog("coords x y " + coords.x[position] + " " + coords.y[position]);
                position++; 
                rest_positions++; 
                mins_remaining = mins_remaining - params.time_between_positions;      
            }
            move_period = true;
        }
    }

    //clog("Simulation completed");
    $("#statistics").html("Move positions: " 
    	+ (position-rest_positions) 
    	+ "<br/>Rest positions: " + rest_positions
		+ "</br>Time (hours): " + (params.positions_to_run * params.time_between_positions/60).toFixed(2)
		+ "<br/>Distance traversed (miles): " + cumulative_dist.toFixed(2) 
		+ "<br/>Average speed during move periods (mph): "
		+ (cumulative_dist/((position-rest_positions)*params.time_between_positions/60.0)).toFixed(2));
		 
    params.coords = coords;
    plotSimulation(params);

    return;
}

// ============================================================
// -------- plot simulation results ---------------------------
function plotSimulation(p) { // p = params
    clearInterval(timeoutID);
    //$("#message").append("<br/>Plotting ... ").fadeIn(400);

    if ((p.coords == null) || (p.coords.x.length == 0)) // check to see that there's something to plot
        return;
    
    plot = p.plot;
    var x = p.coords.x;
    var y = p.coords.y;
    var xm, ym;
    
    var scale = 0;
    var canvas_size = Math.min(plot.canvas.width, plot.canvas.height);
    // clog("canvas_size " +canvas_size);
    var axis_length = 0;
    var max_x = x[0];
    var min_x = x[0];
    var max_y = y[0];
    var min_y = y[0];
    var i = 0;
    
	clearPlot(p);
  
    // find max and min, use to calc. axis length
    for (i = 1; i < x.length; i++) {
        if (x[i] > max_x) max_x = x[i];
        if (x[i] < min_x) min_x = x[i];
        if (y[i] > max_y) max_y = y[i];
        if (y[i] < min_y) min_y = y[i];
    }
    if ((Math.abs(max_x - min_x)) > Math.abs((max_y - min_y)))   
        axis_length = Math.abs(max_x - min_x);
    else        
        axis_length = Math.abs(max_y - min_y);  // axis_length should be in miles
    //clog ("axis " + axis_length + " min_x " + min_x );

    // find scale for PIlot ... original meant to be printed 9x9inch
    // first find highest-resolution scale that will fit movements on 9x9 inch plot (or whatever map_inches has been set to)
    if (axis_length * (5280/400) < p.map_inches) // i.e., if axis-length is less than 9 inches when plotted 400feet/inch
        scale = 0.076;
    else if (axis_length * (5280/1320) < p.map_inches) // a quarter-mile to the inch
        scale = 0.25;
    else if (axis_length * (5280/2640) < p.map_inches) // a half-mile to the inch
        scale = 0.50;        
    else if (axis_length * (5280/5280) < p.map_inches) // a mile to the inch
        scale = 1.0;
    else {
        $("#message").text("Error: movement exceeds map scale."); //.fadeOut(1000);
        return;
    }
    p.map_scale = parseFloat(p.map_scale);
    //clog("pmapscale " + p.map_scale);
    //clog("scale " + scale);
    if (scale < p.map_scale) // adjust scale upwards if user-specified scale is even larger
        scale = p.map_scale;
    switch (scale) {
        case 0.076:
            p.cross_size = 6;
            break;
        case 0.25:
            p.cross_size = 5;
            break;
        case 0.50:
            p.cross_size = 3;
            break;
        case 1.0:
            p.cross_size = 3;
            break;
    }
        
    // convert miles to pixels. E.g., if scale is .5 (i.e., half-mile per inch), then 1 mile in original coordinates will become 2 (inches).
    // then convert this to canvas coordinates: in the above example, when the map_size is 900 (i.e, 100 pixels per inche),   
    // 2 inches becomes 200 pixels, or 2 * p.map_size/p.map_inches
    var inches_per_mile = 1.0/scale;  // scale = miles per inch
    var pixels_per_inch = parseFloat(canvas_size)/p.map_inches;
    var pixels_per_mile = pixels_per_inch * inches_per_mile; // / 2.0;
    //clog("inches_per_mile " + inches_per_mile);
    //clog("pixels_per_inch " + pixels_per_inch);
    //clog("pixels_per_mile " + pixels_per_mile);
    
    // center the graph on the movement and flip y axis
    plot.save(); // restored in clear function
    xm = pixels_per_mile * (min_x + Math.abs((max_x - min_x) / 2));
    ym = pixels_per_mile * (min_y + Math.abs((max_y - min_y) / 2));    
    plot.translate(canvas_size/2.0 - xm, canvas_size/2.0 + ym); 
    plot.scale(1, -1);
    // clog("canvas_size/2.0 - xm: " + (canvas_size/2.0 - xm) + "canvas_size/2.0-ym: " + (canvas_size/2.0-ym));

    // add scale legend
	plot.fillStyle = p.foreground;
	plot.strokeStyle = p.foreground;

        if (p.show_scale) {
        var legendx = xm - canvas_size/2.0 + canvas_size/40; // put legend 2.5% canvas_size away from lower-left corner
        var legendy = ym  - canvas_size/2.0 + canvas_size/40;
        plot.beginPath();
        plot.moveTo(legendx, legendy);
        plot.lineWidth = 2.0;
        plot.lineTo(legendx  + pixels_per_inch, legendy);
        plot.stroke();  
        plot.save()
        plot.scale(1,-1);
        plot.beginPath();
        switch (canvas_size) {
			case 300:
					plot.font = "8px monospace";
					break;
			case 600:
					plot.font = "12px monospace";
					break;
			case 900:
					plot.font = "16px monospace";
					break;
			case 1200:
					plot.font = "20px monospace";
					break;
			default:
				plot.font = "12px monospace";
        }
        plot.textBaseline = "bottom";
        //clog("scale" + scale);
        switch (scale) {
               case 0.076: 
                    plot.fillText("400 feet",legendx + canvas_size/160, -legendy - canvas_size/80);
                    break;
               case 0.25: 
                    plot.fillText("1/4 mile",legendx + canvas_size/160, -legendy  - canvas_size/80);
                    break;
               case 0.50: 
                    plot.fillText("1/2 mile",legendx + canvas_size/160, -legendy  - canvas_size/80);
                    break;
               case 1.0: 
                    plot.fillText("1 mile",legendx + canvas_size/160, -legendy   - canvas_size/80);
                    break;                
        }
        plot.restore()
    }
        
        
    // do the plotting
    //clog("beginning actual plotting");
	plot.lineWidth = 1;
	if ((p.line_style == "cross") || (p.line_style == "linecross"))
        plotCross(plot, x[0] * pixels_per_mile, y[0] * pixels_per_mile, p.cross_size, p.foreground);
    if (p.show_origin)
        plotOrigin(plot); // mark 0,0 with red diamond - at beginning
    if (p.plotting_delay > 0) {
    	// $("#plotstatus").show();		//$("#stop").show();	//$("#progressbar").show();
        $("#stopblock").css("visibility", "visible");
    	$("#progressbar").progressbar("option", "max", p.coords.x.length);
    	$("#progressbar").progressbar("option", "value", 0);    	
        
        i = 1;
        timeoutID = setInterval(function () {
                 if (i < p.coords.x.length) {
                    // $("#plotstatus").text("Plotting position: " + i);
					$("#progressbar").progressbar( "option", "value", i);
                    plotPosition(i++, p, p.coords.x, p.coords.y, pixels_per_mile); 
                 } else {
                    if (p.show_origin)
                        plotOrigin(plot); // mark 0,0 with red diamond - again at end
                   //$("#stopblock").css("visibility", "hidden");
					//	$("#stop").hide();
                    // $("#progressbar").hide();
                    // $("#plotstatus").hide();
                    clearInterval(timeoutID);
                    generateClickableImage(document.getElementById("plotcanvas"));
                    }
                }, 
             p.plotting_delay);
	    } else { // plot without delay
        for (i=1; i < x.length; i++) {
            plotPosition(i, p, p.coords.x, p.coords.y, pixels_per_mile);
        }
        if (p.show_origin)
            plotOrigin(plot); // mark 0,0 with red diamond - again at end
    } 

    //clog("Plotting completed.");
    //$("#message").text(" Plotting completed."); //.fadeOut(1000);
    generateClickableImage(document.getElementById("plotcanvas"));

    return;   
}

// ============================================================
// ----- generateClickableImage --------- 
function generateClickableImage(c) {
					$("#plotcanvas").off("click");
					$("#plotcanvas").click(function() {
					    window.open(c.toDataURL("image/png"), '_blank',
					    		'width=' + c.width + ',height=' + c.height);
					});
}

// ============================================================
// ----- plot single position ----------
function plotPosition(i, p, x, y, pixels_per_mile) {
    //clog("plotpos " + i);
    plot = p.plot;
    
    var xm = x[i] * pixels_per_mile;
    var ym = y[i] * pixels_per_mile;
    // clog(i);
    // clog("xm " + xm + "ym" + ym);
    if ((p.line_style == "line") || (p.line_style == "linecross")) {
        plot.beginPath();
		plot.strokeStyle = p.foreground;
        plot.moveTo(x[i - 1] * pixels_per_mile, y[i - 1] * pixels_per_mile); // start pen at previous point
        plot.lineTo(xm,ym);
        plot.stroke();
    } 
    if ((p.line_style == "cross") || (p.line_style == "linecross")) {
        // plot cross at new position
        // clog("plotting cross");
        plotCross(plot, xm, ym, p.cross_size, p.foreground);
    } 
    return;
} 

// ============================================================
// ----- plot origin ----------
function plotOrigin(plot) {
    plot.beginPath();
	plot.strokeStyle = "ff0000";
    plot.moveTo(0,10);
    plot.lineTo(10,0);
    plot.lineTo(0,-10);
    plot.lineTo(-10,0);
    plot.lineTo(0,10);
    plot.stroke();
    return;
}

// ============================================================
// ----- plotCross ----------
function plotCross (plot, xm, ym, cross_size, colorstring) {
    plot.beginPath();
    plot.strokeStyle = colorstring; 
    plot.moveTo(xm,ym);
    plot.lineTo(xm + cross_size, ym);
    plot.lineTo(xm - cross_size, ym);
    plot.moveTo(xm, ym);
    plot.lineTo(xm, ym  + cross_size);
    plot.lineTo(xm, ym - cross_size);
    plot.moveTo(xm, ym);
    plot.stroke();     
    return;
}


// ============================================================
// ----- console log alias ----------
function clog(o) { console.log(o); }

// ============================================================
// -------- set up canvas --------------------------------
function initializePlot(id, colorstring) {
    var canvas = document.getElementById(id);
    var plot = canvas.getContext("2d");

	//clog("init "  + colorstring);
    plot.fillStyle = colorstring;
    plot.fillRect(0,0, plot.canvas.width, plot.canvas.height);
	plot.save();

    return plot;
}

// ============================================================
// -------- calc angle ----------------------------------------
function calcAngle (distr, prev_angle) {
    var i = randDistrBin(distr); 
    //clog ("randdistrbin " + i +  " prevangle " + prev_angle);
    var angle = i * 5 + (i - 1) * 5; // minimum angle 5 degrees, increment by 10 ... i.e., 10 * i - 5
    if (angle < 180)
        angle = 180 - angle + prev_angle;  
    else if (angle < 360) {
        angle = 540 - angle + prev_angle;      
    } else {
        $("#message").text("Error: angle is out of bounds."); 
        			//.fadeOut(1000); //.fadeIn(400); 
        return;
    }  
    if (angle > 360)
        angle -= 360;   
    return angle;
}

// ============================================================
// -------- calc distance to move ----------------------------------------
function calcDist (dist_distr, dist_multiple) {
    var i = randDistrBin(dist_distr); 
    if (dist_multiple == 50) { 
        dist = i * 50 + (i-1) * 50;
    } else if (dist_multiple == 25) {
        dist = i * 25 + (i-1) * 25;            
    } else {
        $("#message").text("Error: invalid distance multiplier."); //.fadeOut(1000); //.fadeIn(400); 
        return;
    }
    dist = dist / 5280.0; // convert from feet to miles
    return dist;
}

// ============================================================
//  -------- randomly select bin of distribution  -----------------
function randDistrBin(distr) {
    var rn = Math.random(); // RN
    var m = 0; // M ..... but indexing from 0 rather than 1
    while (rn > 0) {
        rn = rn - distr[m];
        m += 1;
    }
    return m;
}

// ============================================================
//  -------- returns params and distributions  -----------------------
function getParams() {
    var params = {
        // these distributions taken from dissertation of DB Siniff, 1967, Table 10, p. 106
		distr: {
			"default": {
				name: "default",
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				ang: [0.02778,0.02778,0.02778,0.02778, 0.02778, 0.02778, 0.02778,
					0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02778,
								0.02777,
								0.02777,
								0.02777,
								0.02777,
								0.02777,
								0.02777,
								0.02777,
								0.02777],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194]
					},
			"uniform": { 
				name:"uniform",
				move: [.063,.063,.063,.063,.063,.063,.063,.063,.063,.063,
						.063,.063,.063,.063,.063,.063],
				rest: [.1,.1,.1,.1,.1,.1,.1,.1,.1,.1],
				ang: [0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,
						0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,
						0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,0.02778,
						0.02778,0.02778,0.02778,0.02778,0.02778, 0.02778] ,
				dist: [.067,.067,.067,.067,.067,.067,.067,.067,.067,.067,
						.067,.067,.067,.067,.067]
						},
			"unimodal (mu=pi, kappa=0)": {
				name:"unimodal (mu=pi, kappa=0)",
				ang:[0.028722 ,  0.028547 ,  0.028723 ,  0.028807 ,  0.028677 ,  0.028459 ,  0.02879 ,  0.028626 ,  0.028614 ,  0.028676 ,  0.028885 ,  0.02859 ,  0.028375 ,  0.028549 ,  0.028263 ,  0.028422 ,  0.028546 ,  0.028374 ,  0.028789 ,  0.028504 ,  0.02851 ,  0.028531 ,  0.028839 ,  0.028134 ,  0.028526 ,  0.028662 ,  0.028369 ,  0.028661 ,  0.028643 ,  0.028361 ,  0.0286 ,  0.028459 ,  0.028738 ,  0.02867 ,  0.028324 ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				},
			"unimodal (mu=pi, kappa=1)": {
					name:"unimodal (mu=pi, kappa=1)",
				ang:[0.008136 , 0.008362 , 0.008941 , 0.009639 , 0.010904 , 0.012405 , 0.014275 , 0.016975 , 0.020187 , 0.023791 , 0.028405 , 0.033488 , 0.039263 , 0.044408 , 0.050055 , 0.054194 , 0.057921 , 0.059166 , 0.059168 , 0.057752 , 0.053582 , 0.050032 , 0.044603 , 0.039128 , 0.033746 , 0.02794 , 0.023717 , 0.020351 , 0.016806 , 0.014658 , 0.012327 , 0.010749 , 0.009612 , 0.008864 , 0.008359 , 0.008091 ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				},
			"unimodal (mu=pi, kappa=5)": {
				name:"unimodal (mu=pi, kappa=5)",
				ang:[0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0.000158 ,  0.000366 ,  0.000863 ,  0.002126 ,  0.005104 ,  0.011617 ,  0.024022 ,  0.046024 ,  0.076892 ,  0.112808 ,  0.143018 ,  0.15377 ,  0.143135 ,  0.113213 ,  0.076998 ,  0.045713 ,  0.024025 ,  0.011414 ,  0.005075 ,  0.00205 ,  0.000814 ,  0.000348 ,  0.000149 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				},
			"unimodal (mu=pi, kappa=10)": {
				name:"unimodal (mu=pi, kappa=10)",
				ang:[0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0.000244 ,  0.001226 ,  0.005518 ,  0.019922 ,  0.055624 ,  0.118802 ,  0.188524 ,  0.220442 ,  0.188745 ,  0.118375 ,  0.05564 ,  0.019769 ,  0.005519 ,  0.001282 ,  0.00025 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				},
				"unimodal (mu=0, kappa=1)": {
				name:"unimodal (mu=0, kappa=1)",
				ang:[				0.059432 , 0.057403 , 0.054217 , 0.049934 , 0.044316 , 0.038931 , 0.033507 , 0.028156 , 0.023681 , 0.020183 , 0.017169 , 0.014606 , 0.01238 , 0.010864 , 0.00956 , 0.009035 , 0.008351 , 0.008277 , 0.008138 , 0.00839 , 0.008944 , 0.00982 , 0.011004 , 0.012504 , 0.014459 , 0.016906 , 0.020052 , 0.023986 , 0.028556 , 0.033492 , 0.03879 , 0.044337 , 0.049859 , 0.054061 , 0.057636 , 0.059064  ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				},
				"unimodal (mu=0, kappa=5)": {
				name:"unimodal (mu=0, kappa=5)",
				ang:[0.147205 , 0.127306 , 0.094554 , 0.061055 , 0.035908 , 0.018317 , 0.008761 , 0.003905 , 0.001587 , 0.00064 , 0.000309 , 0.000154 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0.000107 , 0.000272 , 0.000721 , 0.001684 , 0.003762 , 0.008631 , 0.018223 , 0.035537 , 0.061882 , 0.094762 , 0.126974 , 0.147475 ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				},
				"unimodal (mu=0, kappa=10)": {
				name:"unimodal (mu=0, kappa=10)",
				ang:[0.206808 , 0.153382 , 0.085364 , 0.036636 , 0.012095 , 0.003295 , 0.000743 , 0.000132 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0.000144 , 0.000777 , 0.00325 , 0.012152 , 0.036887 , 0.086315 , 0.154428 , 0.207523  ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				},

			"bimodal (mu=pi, kappa=1)": {
				name:"bimodal (mu=pi, kappa=1)",
				ang:[0.008414 , 0.009234 , 0.011614 , 0.015401 , 0.021981 , 0.031019 , 0.042052 , 0.05186 , 0.058479 , 0.058117 , 0.052078 , 0.041977 , 0.031316 , 0.022074 , 0.015833 , 0.011651 , 0.009176 , 0.008075 , 0.008469 , 0.00926 , 0.011491 , 0.015742 , 0.022023 , 0.030995 , 0.04206 , 0.051857 , 0.058412 , 0.058523 , 0.052023 , 0.041339 , 0.030614 , 0.021983 , 0.015614 , 0.011757 , 0.009235 , 0.008252 ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				},
			"bimodal (mu=pi, kappa=5)": {
				name:"bimodal (mu=pi, kappa=5)",
				ang:[0 ,  0 ,  0 ,  0.000273 ,  0.001495 ,  0.008197 ,  0.035107 ,  0.095029 ,  0.148976 ,  0.127731 ,  0.061567 ,  0.017823 ,  0.003608 ,  0.00057 ,  0.000127 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0.000116 ,  0.000587 ,  0.003536 ,  0.017874 ,  0.061088 ,  0.127697 ,  0.148505 ,  0.095191 ,  0.034851 ,  0.008136 ,  0.001439 ,  0.00026 ,  0 ,  0 ,  0 ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				},
			"bimodal (mu=pi, kappa=10)": {
				name:"bimodal (mu=pi, kappa=10)",
				ang:[0 ,  0 ,  0 ,  0 ,  0 ,  0.000734 ,  0.012663 ,  0.087409 ,  0.204501 ,  0.15287 ,  0.03756 ,  0.003402 ,  0.000135 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0 ,  0.000142 ,  0.003519 ,  0.037668 ,  0.153768 ,  0.204631 ,  0.08756 ,  0.012587 ,  0.000788 ,  0 ,  0 ,  0 ,  0 ,  0 ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				} ,
		     "bimodal (mu=0, kappa=1)": {
				name:"bimodal (mu=0, kappa=1)",
				ang:[0.058343 , 0.052072 , 0.041576 , 0.030999 , 0.022118 , 0.015681 , 0.011678 , 0.009302 , 0.0083 , 0.008307 , 0.009126 , 0.011493 , 0.015835 , 0.02216 , 0.030921 , 0.041643 , 0.052068 , 0.058633 , 0.058501 , 0.051801 , 0.041711 , 0.031072 , 0.021861 , 0.015621 , 0.01172 , 0.009137 , 0.008227 , 0.008125 , 0.009351 , 0.011663 , 0.015515 , 0.022046 , 0.030775 , 0.041725 , 0.052009 , 0.058885 ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				} ,
		     "bimodal (mu=0, kappa=5)": {
				name:"bimodal (mu=0, kappa=5)",
				ang:[0.136703 , 0.07808 , 0.026583 , 0.006104 , 0.001106 , 0.00021 , 0 , 0 , 0 , 0 , 0 , 0 , 0.000224 , 0.001151 , 0.006254 , 0.026898 , 0.077933 , 0.137084 , 0.137551 , 0.078167 , 0.026883 , 0.006262 , 0.001136 , 0.000218 , 0 , 0 , 0 , 0 , 0 , 0 , 0.000222 , 0.001171 , 0.006213 , 0.026955 , 0.078642 , 0.137979 ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				} ,
		     "bimodal (mu=0, kappa=10)": {
				name:"bimodal (mu=0, kappa=10)",
				ang:[0.180549 , 0.061318 , 0.007688 , 0.000461 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0.000436 , 0.007797 , 0.061333 , 0.180459 , 0.180378 , 0.061268 , 0.007842 , 0.000462 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0 , 0.000426 , 0.007687 , 0.06133 , 0.180506  ],
				dist: [.0091,.0341,.0703,.1055,.1286,.1350,.1266,.1086,.0865,.0648,.0462,.0315,.0207,.0130,.0194],
				rest: [.1353,.2707,.2707,.1804,.0902,.0361,.0120,.0034,.0009,.0003],
				move: [.0067,.0337,.0842,.1404,.1755,.1755,.1462,.1044,.0633,.0363,.0181,.0082,.0034,.0031,.0005,.0003]
				} 	 
		},
        begin_with_move: true,
        time_between_positions:1,
        positions_to_run:500,
        dist_multiple: 25,
        x_start:0,
        y_start:0,
        line_style:"linecross", // valid values: "line," "cross", "linecross",
        map_scale:.076, // valid: 0.076, 0.25, .50, 1.0
        plot: null,
        cross_size:5,
        map_inches:9,
        show_origin: false,
        coords: null,
        plotsize:"600x600",
        show_scale: true,
        plotting_delay: 1,
        distr_type:"default",
        foreground:"#000000",
        background:"#eeffee"
    }
        
    return params;
}



