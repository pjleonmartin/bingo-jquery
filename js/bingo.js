var jugadores = 0; // Número de jugadores para la sesión de bingo
var precio_carton = 0; // Precio del cartón (expresado en euros) para la sesión de bingo
var juegoiniciado = false; // Variable booleana (indica si el juego está iniciado, por defecto FALSE)
var velocidad = 500; // Velocidad a la que salen las bolas (expresada en milisegundos)
var bombo = []; // Array de números que contendrá siempre del 1 al 90
var numerosSacados = []; // Array de números (se sacarán del array bombo y se introducirán en numerosSacados al salir)
var intervalo_bolas; // Intervalo

function abrirVentanaCentrada(altura, anchura, html)
{
	var y = parseInt((window.screen.height/2)-(altura/2));
	var x = parseInt((window.screen.width/2)-(anchura/2));
	
	var ventana = window.open("",'_blank','width='+anchura+',height='+altura+',top='+y+',left='+x+',toolbar=no,location=no,status=no,menubar=no,scrollbars=no,directories=no,resizable=no');
	
	ventana.document.write(html);
}

function aleatorio(inicio, fin, numero)
{
	var numeros = [];
	var i = 0;
	if(!numero || numero<=0)
	{
		return Math.floor(Math.random()*(fin-inicio+1)) + inicio;
	}
	else
	{
		while(numeros.length < numero)
		{
			var aleatorios = Math.floor(Math.random()*(fin-inicio+1)) + inicio;
			if(numeros.indexOf(aleatorios) == -1)
			{
				numeros.push(aleatorios);
			}
		}
		return numeros.sort(function(a,b){return a-b;}); //Ordeno los numeros aleatorios que me han dado como resultados
	}
}

function generaCarton()
{
	var contador_huecos = 0;
	var huecos_ultima = 0;
	
	var carton=[[],[],[]];
	
	for (var j = 0; j < 9; j++)
	{
		var columna;
		if(j == 0)
		{
			columna = aleatorio(10*j+1, 10*(j+1)-1, 3);
		}
		else if(j == 8)
		{
			columna = aleatorio(10*j, 10*(j+1), 3);
		}
		else
		{
			columna = aleatorio(10*j, 10*(j+1)-1, 3);
		}
		columna.sort(function(a,b){return a-b;});
		
		for(var i = 0; i < 3; i++)
		{
			carton[i][j] = 
			{
				'valor': columna[i]
			}
		}
	}

	for(var i = 0; i < 2; i++)
	{
		var huecos = aleatorio(0,8,4);
		while(huecos.length > 0)
		{
			carton[i][huecos.shift()].valor = -1;
		}	
	}
	for(var x = 0; x < 9; x++)
	{
		contador_huecos = 0;
		for(var c = 0; c < 3; c++)
		{
			if(huecos_ultima != 4)
			{
				if(carton[c][x].valor == -1)
				{
					contador_huecos++;
				}
			
				if(c == 2 && contador_huecos != 2)
				{
					carton[c][x].valor = -1;
					huecos_ultima++;
					x++;
				}
			}
			else
				break;
		}
	}
	
	return carton;
}

function dibujaCarton(carton, jugador_principal = false)
{
	//Generamos la tabla
	var div = $("div:last");
	
	if(jugador_principal)
		div.append("<table id='carton_jugador' border='1' width='50%' height='200px'>");
	else
		div.append("<table class='carton_otros' border='1'>");
	//Genero las filas
	for(var i = 0; i < carton.length; i++)
	{
		var tabla_generada = $("table:last");
		tabla_generada.append("<tr>");
		//Genero las columnas
		for(var j = 0; j < carton[i].length; j++)
		{
			var fila = $("table:last tr:last");
			fila.append("<td></td>");
			
			if(carton[i][j].valor === -1)
			{
				$("table:last tr:last td:last").addClass('vacio');
			}
			else
			{
				$("table:last tr:last td:last").text(carton[i][j].valor);
			}	
		}
		tabla_generada.append("</tr>");
	}
	div.append("</table><br>");
	
	if(jugador_principal)
		div.append("<div class='centrar'><button id='comprobar_bingo'>COMPROBAR BINGO</button></div>");
}

function init()
{
	$("h2:last").removeAttr("hidden");
	$("table:last").removeAttr("hidden");
	
	jugadores = $("#jugadores_input").val(); // Le damos a la variable 'jugadores' el valor del input
	precio_carton = $("#euros").val(); // Le damos a la variable 'precio_carton' el valor del select de cantidad
	velocidad = $("#milisegundos").val(); // Le damos a la variable 'velocidad' el valor el milisegundos del select
	
	juegoiniciado = true; // Iniciamos el juego
	
	var contenedor_derecho = $("#contenedor_der"); // Lado derecho de la web
	contenedor_derecho.append("<div class='width_entero'><p id='numero'></p></div>"); // Añadimos el círculo donde irán saliendo los números del bombo

	for(var i = 0; i < jugadores; i++) // Por cada jugador se creará un carton
	{
		if(i != 0)
		{
			if(i % 2 != 0)
			{
				contenedor_derecho.append("<div class='carton_izq'>");
			}
			else
			{
				contenedor_derecho.append("<div class='carton_der'>");
			}
		}
		var carton = generaCarton(); // Genera un cartón
		dibujaCarton(carton, i == 0 ? true : false); // Aquí lo dibuja, diferenciando si es el primer cartón (el nuestro) o los siguientes (de otros)
		
		contenedor_derecho.append("</div>");
	}
	
	for(var x = 1; x < 91; x++) // Rellenamos el bombo con todos los números que pueden salir... (del 1 al 90)
	{
		bombo.push(x); // Añadimos el número al array bombo
	}
	
	var tabla = $("#tabla_numeros");
	var primer_numero = 1;
	var ultimo_numero = 10;
	for(var a = 0; a < 10; a++)
	{
		tabla.append("<tr>");
		for(var b = primer_numero; b < ultimo_numero; b++)
		{
			tabla.append("<td>"+ b +"</td>");
		}
		if(ultimo_numero != 90)
		{
			primer_numero += 9;
			ultimo_numero += 9;
		}
		tabla.append("</tr>");
	}
	
	intervalo_bolas = setInterval(peticionAJAX, velocidad);
	
	$("#comprobar_bingo").click(function() {
		if(juegoiniciado)
		{
			if(numerosSacados.length >= 15)
			{
				comprobarBingoJugador();
			}
			else
				alert("Debe esperar a que salgan un mínimo de 15 bolas para comprobar su bingo...");
		}
		else
			alert("El juego no está iniciado, no puede comprobar su bingo...");
	});
	
}

function marcarNumeroSalido(numero)
{
	var jugador = $("#carton_jugador td");
	var cartones_otros = $(".carton_otros td");
	var tabla_salidos = $("#tabla_numeros td");
	tabla_salidos.each(function()
	{
		if($(this).text().trim() == numero)
		{
			$(this).css("background-color", "#ff8080");
		}
	});
	
	cartones_otros.each(function()
	{
		if($(this).text().trim() == numero)
		{
			$(this).addClass("tachado");
		}
	});
}

function peticionAJAX() {
  $.ajax({
    type: "POST",
    url: "numero.php",
    data: { numeros : bombo },
    dataType: "text",
    success: sacarBola,
  });
}

function sacarBola(indice)
{
    nbola = bombo[indice];

	numerosSacados.push(nbola);
	  
	if(numerosSacados.length <= 90)
	{
		bombo.splice(indice, 1);
		$("#numero").text(nbola);
		marcarNumeroSalido(nbola);
		comprobarCartones();
	}
	else
	{
		alert("Se han sacado todos los números...");
	}
}

function comprobarCartones(bingo_principal = "")
{
	var aciertos = 0;
	var ganadores = "";
	var num_ganadores = 0;
	
	var cartones = $(".carton_otros");
	for(var i = 0; i < cartones.length; i++)
	{
		aciertos = 0;
		
		var columnas = cartones.eq(i).find("td");
		for(var j = 0; j < columnas.length; j++)
		{
			if(!columnas.eq(j).hasClass("vacio"))
			{
				if(columnas.eq(j).hasClass("tachado") && jQuery.inArray(columnas.eq(j).text().trim(), numerosSacados))
				{
					aciertos++;
					if(aciertos == 15)
					{
						ganadores+="El cartón número " + (i+1) + " tiene bingo<br>";
						num_ganadores++;
						clearInterval(intervalo_bolas);
					}
				}
			}
		}
	}
	
	if(bingo_principal != "") num_ganadores++;
	
	
	if(ganadores != "" || bingo_principal != "")
	{
		ganadores = ganadores+"<br>El premio para cada jugador con cartón premiado es de: "+(jugadores*precio_carton)/num_ganadores*0.8+"€";
			
		if(bingo_principal == "")
		{
			abrirVentanaCentrada(410, 520, "<body style='background: #F2F3EB;'><h1>Bingos comprobados</h1><br><br>"+ganadores+"<br><br><button style='margin:10px auto; display:block;' onClick='window.close()'>Cerrar ventana</button></body>");
		}
		else
		{
			abrirVentanaCentrada(410, 520, bingo_principal+"<body style='background: #F2F3EB;'><h1>Bingos comprobados</h1><br><br>"+ganadores+"<br><br><button style='margin:10px auto; display:block;' onClick='window.close()'>Cerrar ventana</button></body>");
		}
	}
}

function comprobarBingoJugador()
{
	var aciertos = 0;
	
	var carton = $("#carton_jugador td");
	for(var i = 0; i < carton.length; i++)
	{
		if(carton.eq(i).hasClass("tachado") && numerosSacados.includes(parseInt(carton.eq(i).text().trim())))
		{
			aciertos++;
			if(aciertos == 15)
			{
				clearInterval(intervalo_bolas);
				comprobarCartones("<h1 style='color:green'>¡Felicidades! Has cantado bingo, pero podría haber otros</h1>");
			}
		}
	}
	if(aciertos < 15)
	{
		abrirVentanaCentrada(410, 520, "<body style='background: #F2F3EB;'><img style='margin:10px auto; display:block; width: 40%; height: 40%;' src='data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiPgo8Y2lyY2xlIHN0eWxlPSJmaWxsOiMwMDVFQ0U7IiBjeD0iMjU2IiBjeT0iMjU2IiByPSIyNTYiLz4KPHBhdGggc3R5bGU9ImZpbGw6IzAwNDc5QjsiIGQ9Ik01MTIsMjU2YzAtMzQuMzAyLTYuNzYzLTY3LjAxOS0xOS4wMDItOTYuOTE1bC00Ny43ODEtNDcuNzgxSDI1Nkg2Ni43ODN2Mjg5LjM5MWgwLjA4OGwtMC4wODgsMC4wNjUgIGw5Mi4xOTMsOTIuMTkzQzE4OC45MDEsNTA1LjIyLDIyMS42NTcsNTEyLDI1Niw1MTJDMzk3LjM4NSw1MTIsNTEyLDM5Ny4zODQsNTEyLDI1NnoiLz4KPHJlY3QgeD0iNjYuNzgzIiB5PSIxMTEuMzA0IiBzdHlsZT0iZmlsbDojRkZEQTQ0OyIgd2lkdGg9IjM3OC40MzUiIGhlaWdodD0iMjg5LjM5MSIvPgo8cmVjdCB4PSIyNTYiIHk9IjExMS4zMDQiIHN0eWxlPSJmaWxsOiNGRkE3MzM7IiB3aWR0aD0iMTg5LjIxNyIgaGVpZ2h0PSIyODkuMzkxIi8+CjxyZWN0IHg9Ijg5LjA0MyIgeT0iMTMzLjU2NSIgc3R5bGU9ImZpbGw6I0ZGMzUwMTsiIHdpZHRoPSIzMzMuOTEzIiBoZWlnaHQ9IjI0NC44NyIvPgo8cmVjdCB4PSIyNTYiIHk9IjEzMy41NjUiIHN0eWxlPSJmaWxsOiNDNzAwMjQ7IiB3aWR0aD0iMTY2Ljk1NyIgaGVpZ2h0PSIyNDQuODciLz4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTE2My44MzQsMjM5LjEyM2MtNS4yOTUsNC40Ni0xMS4zOSw2LjY4OC0xOC4yODcsNi42ODhjLTQuODA2LDAtOS40MDUtMC44NTMtMTMuNzk0LTIuNTYgICBjLTQuMzg4LTEuNzA2LTguMjIxLTQuMTk2LTExLjQ5NC03LjQ3MWMtMy4yNzUtMy4yNzMtNS44ODctNy4yNzktNy44MzctMTIuMDE4Yy0xLjk1MS00LjczNy0yLjkyNi0xMC4xMzYtMi45MjYtMTYuMTk3ICAgYzAtNS4yMjUsMC45NzUtMTAuMDg0LDIuOTI2LTE0LjU3OGMxLjk1LTQuNDkzLDQuNjMyLTguMzk1LDguMDQ2LTExLjcwNGMzLjQxMy0zLjMwOCw3LjQzNi01LjkyLDEyLjA2OS03LjgzNyAgIGM0LjYzMi0xLjkxNiw5LjYzLTIuODc0LDE0Ljk5Ni0yLjg3NGMzLjM0NCwwLDYuNTQ3LDAuMzY1LDkuNjEzLDEuMDk3YzMuMDY0LDAuNzMxLDUuOTA0LDEuODEyLDguNTE2LDMuMjQgICBjMi42MTIsMS40MjksNC45NjMsMy4xMzUsNy4wNTMsNS4xMmMyLjA5LDEuOTg2LDMuNzk3LDQuMjMyLDUuMTIxLDYuNzQxbC0xNS4xNTIsMTEuNTk5Yy0xLjQ2NC0yLjkyNi0zLjY1Ny01LjI3Ny02LjU4My03LjA1MyAgIGMtMi45MjYtMS43NzUtNi4wMjctMi42NjUtOS4zMDEtMi42NjVjLTIuNDM5LDAtNC42NjgsMC40ODktNi42ODgsMS40NjRjLTIuMDIsMC45NzYtMy43NjEsMi4zMzUtNS4yMjUsNC4wNzUgICBjLTEuNDYzLDEuNzQzLTIuNjEyLDMuODE0LTMuNDQ4LDYuMjE3Yy0wLjgzNiwyLjQwMy0xLjI1NCw1LjAzNC0xLjI1NCw3Ljg4OWMwLDIuOTI2LDAuNDE5LDUuNTc1LDEuMjU0LDcuOTQzICAgYzAuODM2LDIuMzY5LDIuMDAyLDQuNDA3LDMuNTAyLDYuMTEzYzEuNDk3LDEuNzA5LDMuMjkxLDMuMDMxLDUuMzgsMy45N2MyLjA5LDAuOTQxLDQuNDIzLDEuNDExLDcuMDAxLDEuNDExICAgYzUuOTIsMCwxMS4xNDYtMi40MzgsMTUuNjc1LTcuMzE1aC0xMi44NTN2LTE0LjYzaDMwLjUxM3YzOS41aC0xNi44MjV2LTYuMTY3SDE2My44MzR6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTIwOS45MTgsMTcxLjA5NmgxOC42bDI1LjcwNyw3NC4xOTJoLTIwLjY5MWwtNC40OTMtMTQuNTI1aC0xOS43NDlsLTQuMzg5LDE0LjUyNWgtMjAuNzk1ICAgTDIwOS45MTgsMTcxLjA5NnogTTIyNS44MDEsMjE3LjE3OWwtNi41ODMtMjIuOTg5bC02Ljg5OCwyMi45ODlMMjI1LjgwMSwyMTcuMTc5TDIyNS44MDEsMjE3LjE3OXoiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNGRkZGRkY7IiBkPSJNMzE2LjUwMywyNDUuMjg5di0zOS4wODJsLTEyLjQzNSwyNy40ODNIMjkzLjJsLTEyLjQzNi0yNy40ODN2MzkuMDgyaC0yMC4zNzZ2LTc0LjE5MmgyMi4yNTkgICBMMjk4LjYzNCwyMDZsMTYuMDkyLTM0LjkwM2gyMi4xNTR2NzQuMTkyTDMxNi41MDMsMjQ1LjI4OUwzMTYuNTAzLDI0NS4yODl6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTQwMi41MDMsMjI3LjUyNXYxNy43NjRoLTUyLjg3NnYtNzQuMTkyaDUxLjkzNXYxNy43NjRoLTMxLjU1OHYxMC40NDloMjYuOTYxdjE2LjUxaC0yNi45NjF2MTEuNzA0ICAgaDMyLjVWMjI3LjUyNXoiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNGRkZGRkY7IiBkPSJNMTU0LjYzOCwzNDEuNDI2Yy01LjY0MiwwLTEwLjc2My0xLjA3OS0xNS4zNi0zLjIzOWMtNC41OTgtMi4xNTgtOC41MzUtNC45OTktMTEuODA5LTguNTE3ICAgYy0zLjI3NS0zLjUxNi01LjgxNy03LjU0LTcuNjI4LTEyLjA2OWMtMS44MTItNC41MjgtMi43MTctOS4xOTYtMi43MTctMTQuMDAyYzAtNC44NzYsMC45MzktOS41NzgsMi44MjItMTQuMTA3ICAgYzEuODgxLTQuNTI4LDQuNTA5LTguNTE3LDcuODg5LTExLjk2NWMzLjM3OC0zLjQ0OCw3LjM4My02LjIsMTIuMDE4LTguMjU1YzQuNjMyLTIuMDU1LDkuNy0zLjA4MywxNS4yMDQtMy4wODMgICBjNS42NDMsMCwxMC43NjMsMS4wODIsMTUuMzYxLDMuMjRjNC41OTcsMi4xNiw4LjUzMyw1LjAxNSwxMS44MDgsOC41NjljMy4yNzMsMy41NTIsNS43OTksNy41OTMsNy41NzYsMTIuMTIxICAgYzEuNzc2LDQuNTI5LDIuNjY1LDkuMTYxLDIuNjY1LDEzLjg5N2MwLDQuODc3LTAuOTM5LDkuNTYyLTIuODIyLDE0LjA1NmMtMS44ODEsNC40OTMtNC40OTMsOC40NjQtNy44MzcsMTEuOTEzICAgYy0zLjM0NCwzLjQ0OC03LjMzMiw2LjIxNi0xMS45NjQsOC4zMDdDMTY1LjIwOSwzNDAuMzgxLDE2MC4xNCwzNDEuNDI2LDE1NC42MzgsMzQxLjQyNnogTTEzNy44MTUsMzAzLjgwNyAgIGMwLDIuNTA5LDAuMzQ4LDQuOTMsMS4wNDUsNy4yNjNjMC42OTYsMi4zMzUsMS43NDEsNC40MDgsMy4xMzUsNi4yMTdjMS4zOTIsMS44MTIsMy4xNTEsMy4yNzYsNS4yNzcsNC4zODkgICBjMi4xMjUsMS4xMTUsNC42NSwxLjY3Miw3LjU3NiwxLjY3MnM1LjQ2OC0wLjU3NCw3LjYyOC0xLjcyNGMyLjE1OS0xLjE1LDMuOTE5LTIuNjQ3LDUuMjc4LTQuNDk0ICAgYzEuMzU4LTEuODQ1LDIuMzY3LTMuOTUyLDMuMDMtNi4zMjJjMC42NjEtMi4zNjcsMC45OTMtNC43NzEsMC45OTMtNy4yMDljMC0yLjUwOS0wLjM0OS00LjkyNy0xLjA0NS03LjI2MyAgIGMtMC42OTctMi4zMzQtMS43NjEtNC4zODktMy4xODctNi4xNjVjLTEuNDI5LTEuNzc2LTMuMjA2LTMuMjAzLTUuMzMtNC4yODRjLTIuMTI2LTEuMDgtNC42MTYtMS42MTktNy40NzEtMS42MTkgICBjLTIuOTI2LDAtNS40NTMsMC41NTktNy41NzYsMS42NzJjLTIuMTI2LDEuMTE1LTMuODg1LDIuNTk2LTUuMjc3LDQuNDQxYy0xLjM5NSwxLjg0Ny0yLjQyMiwzLjkzNy0zLjA4Myw2LjI3ICAgQzEzOC4xNDQsMjk4Ljk4NSwxMzcuODE1LDMwMS4zNywxMzcuODE1LDMwMy44MDd6Ii8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTIxMi41MywyNjYuNjA3bDE0LjUyNSw0OC41OTFsMTQuMzE2LTQ4LjU5MWgyMS40MjJsLTI3LjI3NCw3NC4xOTNoLTE2LjkyOGwtMjcuNTg3LTc0LjE5M0gyMTIuNTN6ICAgIi8+Cgk8cGF0aCBzdHlsZT0iZmlsbDojRkZGRkZGOyIgZD0iTTMyMS4zMSwzMjMuMDM1djE3Ljc2NGgtNTIuODc2di03NC4xOTJoNTEuOTM1djE3Ljc2NEgyODguODF2MTAuNDQ5aDI2Ljk2MXYxNi41MUgyODguODF2MTEuNzA0ICAgaDMyLjVWMzIzLjAzNXoiLz4KCTxwYXRoIHN0eWxlPSJmaWxsOiNGRkZGRkY7IiBkPSJNMzMwLjgxOSwzNDAuNzk5di03NC4xOTJoMzQuMDY3YzMuNjIyLDAsNi45NjQsMC43NDksMTAuMDMxLDIuMjQ3ICAgYzMuMDY0LDEuNDk4LDUuNjk1LDMuNDQ4LDcuODg5LDUuODUxYzIuMTk1LDIuNDAzLDMuOTE5LDUuMTU3LDUuMTcyLDguMjU1YzEuMjU0LDMuMSwxLjg4MSw2LjIxNiwxLjg4MSw5LjM1MiAgIGMwLDQuMzIxLTAuOTM5LDguMzQzLTIuODIsMTIuMDdjLTEuODgyLDMuNzI2LTQuNDk0LDYuNzc2LTcuODM3LDkuMTQ0bDE1LjY3NSwyNy4yNzNoLTIyLjk4OWwtMTMuMDYyLTIyLjc4aC03LjYyOXYyMi43OCAgIEwzMzAuODE5LDM0MC43OTlMMzMwLjgxOSwzNDAuNzk5eiBNMzUxLjE5NSwzMDAuMjU1aDEyLjg1M2MxLjI1MywwLDIuNDItMC42OTYsMy41LTIuMDljMS4wOC0xLjM5MiwxLjYxOS0zLjM0NCwxLjYxOS01Ljg1MiAgIGMwLTIuNTc2LTAuNjI3LTQuNTQ2LTEuODgxLTUuOTA0Yy0xLjI1NC0xLjM1OC0yLjUwOS0yLjAzOC0zLjc2MS0yLjAzOGgtMTIuMzMxTDM1MS4xOTUsMzAwLjI1NUwzNTEuMTk1LDMwMC4yNTV6Ii8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+Cg==' /><h1 style='color: red; text-align: center;'>BINGO INCORRECTO</h1><br><br><p style='text-align:center;'>Continuamos para bingo...</p><br><br><button style='margin:10px auto; display:block;' onClick='window.close()'>Cerrar ventana</button></body>");
	}
}

function generarEventos()
{
	$("#carton_jugador td").click(function() {
		if(!$(this).hasClass("vacio"))
		{
			if(!$(this).hasClass("tachado"))
			{
				$(this).addClass("tachado");
			}
			else
			{
				$(this).removeClass("tachado");
			}
		}
	});
}

$(document).ready(function() {
	$("#boton_formulario").click(function() {
		var jugadores_input = $("#jugadores_input").val();
		if(!juegoiniciado)
		{
			if(jugadores_input >= 5 && jugadores_input <= 20)
			{
				init();
				generarEventos();
			}
			else
				alert("Especifique la cantidad de jugadores (entre 5 y 20)");
		}
		else
			alert("Ya hay un juego iniciado...");
	});
});