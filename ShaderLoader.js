/**
 * ShaderLoader.js v1.0
 * An asynchronous shader loader for WebGL using AJAX with jQuery.
 *
 * Copyright (c) 2013 - 2014 Andre Cruz / http://andre-cruz.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*
* Dependencies: jQuery
* Documentation: https://github.com/codecruzer/webgl-shader-loader-js
*/

var SHADER_LOADER = SHADER_LOADER || {};

/**
 * Loads all shaders from an external file that are included in the
 * DOM as script elements. See comments in ShaderLoader.js for documentation.
 * 
 * @param {Function} Callback invoked when all shaders have loaded with signature
 * function (data) {}
 */
SHADER_LOADER.load = function (onShadersLoaded)
{
	/**
	 * Checks if there are any shaders still pending to load.
	 * If there are none remaining, then invoke the onShadersLoaded
	 * callback.
	 * 
	 */	
	var checkForRemaining = function ()
	{
		if (unloadedRemaining <= 0 &&
			onShadersLoaded)
		{
			onShadersLoaded(loadedShaders);
		}
	}

	/**
	 * Loads an external shader file asynchronously using AJAX
	 * 
	 * @param {Object} The shader script tag from the DOM
	 * @param {String} The type of shader [vertex|fragment]
	 */
	var loadShaderFile = function (shaderElement, type)
	{
		/**
		 * Processes a shader that comes back from
		 * the AJAX and stores it in the Shaders
		 * Object for later on
		 * 
		 * @param {Object} The jQuery XHR object
		 * @param {String} The response text, e.g. success, error
		 */
		var onComplete = function onComplete(jqXHR, textStatus)
		{
			--unloadedRemaining;
			
			if (!loadedShaders[name])
			{
				loadedShaders[name] = {
					vertex: "",
					fragment: ""
				};
			}
			
			loadedShaders[name][type] = jqXHR.responseText;

			checkForRemaining();
		}

		var element = $(shaderElement);
		var url = element.data("src");
		var name = element.data("name");

		$.ajax(
			{
				url: url,
				dataType: "text",
				context: {
					name: name,
					type: type
				},
				complete: onComplete
			}
		);
	}

	/************************
	* Load the shaders here *
	************************/

	var loadedShaders = {};

	// Get all of the shaders from the DOM
	var vertexShaders = $('script[type="x-shader/x-vertex"]');
	var fragmentShaders = $('script[type="x-shader/x-fragment"]');

	var unloadedRemaining = vertexShaders.length + fragmentShaders.length;
	
	// Load vertex shaders
	var shader;
	var i, shaderCount;
	for (i = 0, shaderCount = vertexShaders.length; i < shaderCount; ++i)
	{
		shader = vertexShaders[i];
		loadShaderFile(shader, "vertex");
	}

	// Load fragment shaders
	for (i = 0, shaderCount = fragmentShaders.length; i < shaderCount; ++i)
	{
		shader = fragmentShaders[i];
		loadShaderFile(shader, "fragment");
	}
	
	// Check if we're still waiting for any shaders to load, in case they already
	// finished or if there were none.
	checkForRemaining();
}