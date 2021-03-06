/**
 * Constructs a new graph editor
 */
Menus = function(editorUi) {
	this.editorUi = editorUi;
    this.editor = editorUi.editor;
    this.graph = this.editor.graph;
	this.menus = new Object();
	this.communication = editorUi.communication;
	this.init();
	
	// Pre-fetches checkmark image
	new Image().src = IMAGE_PATH + '/checkmark.gif';
};

/**
 * Sets the default font family.
 */
Menus.prototype.defaultFont = 'Helvetica';

/**
 * Sets the default font size.
 */
Menus.prototype.defaultFontSize = '12';

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.defaultFonts = ['Helvetica', 'Verdana', 'Times New Roman', 'Garamond', 'Comic Sans MS',
           		             'Courier New', 'Georgia', 'Lucida Console', 'Tahoma'];

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.init = function() {
	var graph = this.editorUi.editor.graph;
	var isGraphEnabled = mxUtils.bind(graph, graph.isEnabled);

	this.customFonts = [];
	this.customFontSizes = [];
	this.recentOpenedFiles = [];

	this.updateRecentOpenFileList();

	this.put('fontFamily', new Menu(mxUtils.bind(this, function(menu, parent) {
		var addItem = mxUtils.bind(this, function(fontname) {
			var tr = this.styleChange(menu, fontname, [mxConstants.STYLE_FONTFAMILY], [fontname], null, parent, function() {
				document.execCommand('fontname', false, fontname);
			});
			tr.firstChild.nextSibling.style.fontFamily = fontname;
		});
		
		for (var i = 0; i < this.defaultFonts.length; i++) {
			addItem(this.defaultFonts[i]);
		}

		menu.addSeparator(parent);
		
		if (this.customFonts.length > 0) {
			for (var i = 0; i < this.customFonts.length; i++) {
				addItem(this.customFonts[i]);
			}
			
			menu.addSeparator(parent);
			
			menu.addItem(mxResources.get('reset'), null, mxUtils.bind(this, function() {
				this.customFonts = [];
			}), parent);
			
			menu.addSeparator(parent);
		}
		
		this.promptChange(menu, mxResources.get('custom') + '...', '', mxConstants.DEFAULT_FONTFAMILY, mxConstants.STYLE_FONTFAMILY, parent, true, mxUtils.bind(this, function(newValue) {
			this.customFonts.push(newValue);
		}));
	})));
	this.put('formatBlock', new Menu(mxUtils.bind(this, function(menu, parent) {
		function addItem(label, tag) {
			return menu.addItem(label, null, mxUtils.bind(this, function() {
				// TODO: Check if visible
				graph.cellEditor.text2.focus();
	      		document.execCommand('formatBlock', false, '<' + tag + '>');
			}), parent);
		};
		
		addItem(mxResources.get('normal'), 'p');
		
		addItem('', 'h1').firstChild.nextSibling.innerHTML = '<h1 style="margin:0px;">' + mxResources.get('heading') + ' 1</h1>';
		addItem('', 'h2').firstChild.nextSibling.innerHTML = '<h2 style="margin:0px;">' + mxResources.get('heading') + ' 2</h2>';
		addItem('', 'h3').firstChild.nextSibling.innerHTML = '<h3 style="margin:0px;">' + mxResources.get('heading') + ' 3</h3>';
		addItem('', 'h4').firstChild.nextSibling.innerHTML = '<h4 style="margin:0px;">' + mxResources.get('heading') + ' 4</h4>';
		addItem('', 'h5').firstChild.nextSibling.innerHTML = '<h5 style="margin:0px;">' + mxResources.get('heading') + ' 5</h5>';
		addItem('', 'h6').firstChild.nextSibling.innerHTML = '<h6 style="margin:0px;">' + mxResources.get('heading') + ' 6</h6>';
		
		addItem('', 'pre').firstChild.nextSibling.innerHTML = '<pre style="margin:0px;">' + mxResources.get('formatted') + '</pre>';
		addItem('', 'blockquote').firstChild.nextSibling.innerHTML = '<blockquote style="margin-top:0px;margin-bottom:0px;">' + mxResources.get('blockquote') + '</blockquote>';
	})));
	this.put('fontSize', new Menu(mxUtils.bind(this, function(menu, parent) {
		var sizes = [6, 8, 9, 10, 11, 12, 14, 18, 24, 36, 48, 72];
		
		var addItem = mxUtils.bind(this, function(fontsize) {
			this.styleChange(menu, fontsize, [mxConstants.STYLE_FONTSIZE], [fontsize], null, parent, function() {
				// Creates an element with arbitrary size 3
				document.execCommand('fontSize', false, '3');
				
				// Changes the css font size of the first font element inside the in-place editor with size 3
				// hopefully the above element that we've just created. LATER: Check for new element using
				// previous result of getElementsByTagName (see other actions)
				var elts = graph.cellEditor.text2.getElementsByTagName('font');
				
				for (var i = 0; i < elts.length; i++) {
					if (elts[i].getAttribute('size') == '3') {
						elts[i].removeAttribute('size');
						elts[i].style.fontSize = fontsize + 'px';
						
						break;
					}
				}
			});
		});
		
		for (var i = 0; i < sizes.length; i++) {
			addItem(sizes[i]);
		}

		menu.addSeparator(parent);
		
		if (this.customFontSizes.length > 0) {
			for (var i = 0; i < this.customFontSizes.length; i++) {
				addItem(this.customFontSizes[i]);
			}
			
			menu.addSeparator(parent);
			
			menu.addItem(mxResources.get('reset'), null, mxUtils.bind(this, function() {
				this.customFontSizes = [];
			}), parent);
			
			menu.addSeparator(parent);
		}
		
		this.promptChange(menu, mxResources.get('custom') + '...', '(pt)', '12', mxConstants.STYLE_FONTSIZE, parent, true, mxUtils.bind(this, function(newValue) {
			this.customFontSizes.push(newValue);
		}));
	})));
	this.put('linewidth', new Menu(mxUtils.bind(this, function(menu, parent) {
		var sizes = [1, 2, 3, 4, 8, 12, 16, 24];
		
		for (var i = 0; i < sizes.length; i++) {
			this.styleChange(menu, sizes[i] + 'px', [mxConstants.STYLE_STROKEWIDTH], [sizes[i]], null, parent);
		}
		
		menu.addSeparator(parent);
		this.promptChange(menu, mxResources.get('custom') + '...', '(px)', '1', mxConstants.STYLE_STROKEWIDTH, parent);
	})));
	this.put('connection', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.edgeStyleChange(menu, mxResources.get('line'), [mxConstants.STYLE_SHAPE, 'width'], [null, null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('link'), [mxConstants.STYLE_SHAPE, 'width'], ['link', null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('arrow'), [mxConstants.STYLE_SHAPE, 'width'], ['flexArrow', null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('simpleArrow'), [mxConstants.STYLE_SHAPE, 'width'], ['arrow', null], null, parent, true);
	})));
	this.put('waypoints', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.edgeStyleChange(menu, mxResources.get('straight'), [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE], [null, null, null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('orthogonal'), [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE], ['orthogonalEdgeStyle', null, null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('curved'), [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE], ['orthogonalEdgeStyle', '1', null], null, parent, true);
		this.edgeStyleChange(menu, mxResources.get('entityRelation'), [mxConstants.STYLE_EDGE, mxConstants.STYLE_CURVED, mxConstants.STYLE_NOEDGESTYLE], ['entityRelationEdgeStyle', null, null], null, parent, true);
	})));
	this.put('lineend', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.styleChange(menu, mxResources.get('classic'), [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_CLASSIC], null, parent);
		this.styleChange(menu, mxResources.get('openArrow'), [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_OPEN], null, parent);
		this.styleChange(menu, mxResources.get('block') , [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_BLOCK], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('oval'), [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_OVAL], null, parent);
		this.styleChange(menu, mxResources.get('diamond'), [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_DIAMOND], null, parent);
		this.styleChange(menu, mxResources.get('diamondThin'), [mxConstants.STYLE_ENDARROW], [mxConstants.ARROW_DIAMOND_THIN], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('none'), [mxConstants.STYLE_ENDARROW], [mxConstants.NONE], null, parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('transparent'), null, function() { graph.toggleCellStyles('endFill', true); }, parent, null, true);
		menu.addSeparator(parent);
		this.promptChange(menu, mxResources.get('targetSpacing') + '...', '(px)', '0', mxConstants.STYLE_TARGET_PERIMETER_SPACING, parent);
		this.promptChange(menu, mxResources.get('size') + '...', '(px)', mxConstants.DEFAULT_MARKERSIZE, mxConstants.STYLE_ENDSIZE, parent);
	})));
	this.put('linestart', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.styleChange(menu, mxResources.get('classic'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_CLASSIC], null, parent);
		this.styleChange(menu, mxResources.get('openArrow'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_OPEN], null, parent);
		this.styleChange(menu, mxResources.get('block'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_BLOCK], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('oval'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_OVAL], null, parent);
		this.styleChange(menu, mxResources.get('diamond'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_DIAMOND], null, parent);
		this.styleChange(menu, mxResources.get('diamondThin'), [mxConstants.STYLE_STARTARROW], [mxConstants.ARROW_DIAMOND_THIN], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('none'), [mxConstants.STYLE_STARTARROW], [mxConstants.NONE], null, parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('transparent'), null, function() { graph.toggleCellStyles('startFill', true); }, parent, null, true);
		menu.addSeparator(parent);
		this.promptChange(menu, mxResources.get('sourceSpacing') + '...', '(px)', '0', mxConstants.STYLE_SOURCE_PERIMETER_SPACING, parent);
		this.promptChange(menu, mxResources.get('size') + '...', '(px)', mxConstants.DEFAULT_MARKERSIZE, mxConstants.STYLE_STARTSIZE, parent);
	})));
	this.put('spacing', new Menu(mxUtils.bind(this, function(menu, parent) {
		// Uses shadow action and line menu to analyze selection
		var vertexSelected = this.editorUi.actions.get('shadow').enabled;
		
		if (vertexSelected || menu.showDisabled) {
			this.promptChange(menu, mxResources.get('top'), '(px)', '0', mxConstants.STYLE_SPACING_TOP, parent, vertexSelected);
			this.promptChange(menu, mxResources.get('right'), '(px)', '0', mxConstants.STYLE_SPACING_RIGHT, parent, vertexSelected);
			this.promptChange(menu, mxResources.get('bottom'), '(px)', '0', mxConstants.STYLE_SPACING_BOTTOM, parent, vertexSelected);
			this.promptChange(menu, mxResources.get('left'), '(px)', '0', mxConstants.STYLE_SPACING_LEFT, parent, vertexSelected);
			menu.addSeparator(parent);
			this.promptChange(menu, mxResources.get('global'), '(px)', '0', mxConstants.STYLE_SPACING, parent, vertexSelected);
			this.promptChange(menu, mxResources.get('perimeter'), '(px)', '0', mxConstants.STYLE_PERIMETER_SPACING, parent, vertexSelected);
		}
	})));
	this.put('format', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.addMenuItems(menu, ['fillColor'], parent);
		this.addSubmenu('gradient', menu, parent);
		this.addMenuItems(menu, ['image', '-', 'shadow'], parent);
		this.promptChange(menu, mxResources.get('opacity'), '(%)', '100', mxConstants.STYLE_OPACITY, parent, this.editorUi.actions.get('fillColor').enabled);
		this.addMenuItems(menu, ['-', 'solid', 'dashed', 'dotted', '-', 'sharp', 'rounded', 'curved', '-', 'strokeColor'], parent);
		this.addSubmenu('linewidth', menu, parent);
		this.addMenuItems(menu, ['-'], parent);
		this.addSubmenu('connection', menu, parent);
		this.addSubmenu('waypoints', menu, parent);
		this.addMenuItems(menu, ['-'], parent);
		this.addSubmenu('linestart', menu, parent);
		this.addSubmenu('lineend', menu, parent);
		this.addMenuItems(menu, ['-', 'setAsDefaultStyle', 'clearDefaultStyle'], parent);
	})));
	this.put('gradient', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.addMenuItems(menu, ['gradientColor', '-'], parent);
		this.styleChange(menu, mxResources.get('north'), [mxConstants.STYLE_GRADIENT_DIRECTION], [mxConstants.DIRECTION_NORTH], null, parent);
		this.styleChange(menu, mxResources.get('east'), [mxConstants.STYLE_GRADIENT_DIRECTION], [mxConstants.DIRECTION_EAST], null, parent);
		this.styleChange(menu, mxResources.get('south'), [mxConstants.STYLE_GRADIENT_DIRECTION], [mxConstants.DIRECTION_SOUTH], null, parent);
		this.styleChange(menu, mxResources.get('west'), [mxConstants.STYLE_GRADIENT_DIRECTION], [mxConstants.DIRECTION_WEST], null, parent);
	})));
	this.put('text', new Menu(mxUtils.bind(this, function(menu, parent) {
		var enabled = this.editorUi.actions.get('fontColor').enabled;
		menu.addSeparator(parent);
		this.addMenuItem(menu, 'fontColor', parent);
		this.addMenuItems(menu, ['backgroundColor', 'borderColor', '-'], parent);
		this.addSubmenu('fontFamily', menu, parent);
		this.addSubmenu('fontSize', menu, parent);
		this.addMenuItems(menu, ['-', 'bold', 'italic', 'underline', '-'], parent);
	    this.addSubmenu('alignment', menu, parent);
	    this.addSubmenu('position', menu, parent);
		this.addSubmenu('spacing', menu, parent);
		menu.addSeparator(parent);
		this.addSubmenu('writingDirection', menu, parent);
		this.addMenuItem(menu, 'formattedText', parent);
		this.addMenuItem(menu, 'wordWrap', parent);
		menu.addSeparator(parent);
		this.promptChange(menu, mxResources.get('textOpacity'), '(%)', '100', mxConstants.STYLE_TEXT_OPACITY, parent, enabled);
		menu.addItem(mxResources.get('hide'), null, function() { graph.toggleCellStyles(mxConstants.STYLE_NOLABEL, false); }, parent, null, enabled);
	})));
	this.put('alignment', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.styleChange(menu, mxResources.get('leftAlign'), [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_LEFT], null, parent,
				function() { document.execCommand('justifyleft', false, null); });
		this.styleChange(menu, mxResources.get('center'), [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_CENTER], null, parent,
				function() { document.execCommand('justifycenter', false, null); });
		this.styleChange(menu, mxResources.get('rightAlign'), [mxConstants.STYLE_ALIGN], [mxConstants.ALIGN_RIGHT], null, parent,
				function() { document.execCommand('justifyright', false, null); });
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('topAlign'), [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_TOP], null, parent);
		this.styleChange(menu, mxResources.get('middle'), [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_MIDDLE], null, parent);
		this.styleChange(menu, mxResources.get('bottomAlign'), [mxConstants.STYLE_VERTICAL_ALIGN], [mxConstants.ALIGN_BOTTOM], null, parent);
		menu.addSeparator(parent);
		var enabled = this.get('text').enabled;
		menu.addItem(mxResources.get('vertical'), null, function() { graph.toggleCellStyles(mxConstants.STYLE_HORIZONTAL, true); }, parent, null, enabled);
	})));
	this.put('position', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.styleChange(menu, mxResources.get('top'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN, mxConstants.STYLE_VERTICAL_ALIGN],
			[mxConstants.ALIGN_TOP, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_BOTTOM], null, parent);
		this.styleChange(menu, mxResources.get('right'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN, mxConstants.STYLE_VERTICAL_ALIGN],
			[mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_MIDDLE], null, parent);
		this.styleChange(menu, mxResources.get('bottom'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN, mxConstants.STYLE_VERTICAL_ALIGN],
			[mxConstants.ALIGN_BOTTOM, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_TOP], null, parent);
		this.styleChange(menu, mxResources.get('left'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN, mxConstants.STYLE_VERTICAL_ALIGN],
			[mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_LEFT, mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_MIDDLE], null, parent);
		menu.addSeparator(parent);
		this.styleChange(menu, mxResources.get('center'), [mxConstants.STYLE_VERTICAL_LABEL_POSITION, mxConstants.STYLE_LABEL_POSITION, mxConstants.STYLE_ALIGN, mxConstants.STYLE_VERTICAL_ALIGN],
			[mxConstants.ALIGN_MIDDLE, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_CENTER, mxConstants.ALIGN_MIDDLE], null, parent);
	})));
	this.put('writingDirection', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.styleChange(menu, mxResources.get('automatic'), [mxConstants.STYLE_TEXT_DIRECTION], [null], null, parent);
		this.styleChange(menu, mxResources.get('leftToRight'), [mxConstants.STYLE_TEXT_DIRECTION], [mxConstants.TEXT_DIRECTION_LTR], null, parent);
		this.styleChange(menu, mxResources.get('rightToLeft'), [mxConstants.STYLE_TEXT_DIRECTION], [mxConstants.TEXT_DIRECTION_RTL], null, parent);
	})));
	this.put('direction', new Menu(mxUtils.bind(this, function(menu, parent) {
		menu.addItem(mxResources.get('flipH'), null, function() { graph.toggleCellStyles(mxConstants.STYLE_FLIPH, false); }, parent);
		menu.addItem(mxResources.get('flipV'), null, function() { graph.toggleCellStyles(mxConstants.STYLE_FLIPV, false); }, parent);
		this.addMenuItems(menu, ['-', 'rotation'], parent);
	})));
	this.put('align', new Menu(mxUtils.bind(this, function(menu, parent) {
		menu.addItem(mxResources.get('leftAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_LEFT); }, parent);
		menu.addItem(mxResources.get('center'), null, function() { graph.alignCells(mxConstants.ALIGN_CENTER); }, parent);
		menu.addItem(mxResources.get('rightAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_RIGHT); }, parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('topAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_TOP); }, parent);
		menu.addItem(mxResources.get('middle'), null, function() { graph.alignCells(mxConstants.ALIGN_MIDDLE); }, parent);
		menu.addItem(mxResources.get('bottomAlign'), null, function() { graph.alignCells(mxConstants.ALIGN_BOTTOM); }, parent);
	})));
	this.put('distribute', new Menu(mxUtils.bind(this, function(menu, parent) {
		menu.addItem(mxResources.get('horizontal'), null, function() { graph.distributeCells(true); }, parent);
		menu.addItem(mxResources.get('vertical'), null, function() { graph.distributeCells(false); }, parent);
	})));
	this.put('layout', new Menu(mxUtils.bind(this, function(menu, parent) {
		menu.addItem(mxResources.get('horizontalFlow'), null, mxUtils.bind(this, function() {
			var layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
    		this.editorUi.executeLayout(function() {
    			var selectionCells = graph.getSelectionCells();
    			layout.execute(graph.getDefaultParent(), selectionCells.length == 0 ? null : selectionCells);
    		}, true);
		}), parent);
		menu.addItem(mxResources.get('verticalFlow'), null, mxUtils.bind(this, function() {
			var layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_NORTH);
    		this.editorUi.executeLayout(function() {
    			var selectionCells = graph.getSelectionCells();
    			layout.execute(graph.getDefaultParent(), selectionCells.length == 0 ? null : selectionCells);
    		}, true);
		}), parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('horizontalTree'), null, mxUtils.bind(this, function() {
			if (!graph.isSelectionEmpty()) {
				var layout = new mxCompactTreeLayout(graph, true);
				layout.edgeRouting = false;
				layout.levelDistance = 30;
	    		this.editorUi.executeLayout(function() {
	    			layout.execute(graph.getDefaultParent(), graph.getSelectionCell());
	    		}, true);
			}
		}), parent);
		menu.addItem(mxResources.get('verticalTree'), null, mxUtils.bind(this, function() {
			if (!graph.isSelectionEmpty()) {
				var layout = new mxCompactTreeLayout(graph, false);
				layout.edgeRouting = false;
				layout.levelDistance = 30;
	    		this.editorUi.executeLayout(function() {
	    			layout.execute(graph.getDefaultParent(), graph.getSelectionCell());
	    		}, true);
			}
		}), parent);
		menu.addItem(mxResources.get('radialTree'), null, mxUtils.bind(this, function() {
			if (!graph.isSelectionEmpty()) {
				var layout = new mxRadialTreeLayout(graph, false);
	    		this.editorUi.executeLayout(function() {
	    			layout.execute(graph.getDefaultParent(), graph.getSelectionCell());
	    		}, true);
			}
		}), parent);
		menu.addSeparator(parent);
		menu.addItem(mxResources.get('organic'), null, mxUtils.bind(this, function() {
			var layout = new mxFastOrganicLayout(graph);
			
			// Tries to find good force constant by averaging cell width
			var count = 0;
			var sum = 0;
			
			for (var key in graph.getModel().cells) {
				var tmp = graph.getModel().getCell(key);
				
				if (graph.getModel().isVertex(tmp)) {
					var geo = graph.getModel().getGeometry(tmp);

					if (geo != null) {
						sum += geo.width;
						count++;
					}
				}
			}
			
			layout.forceConstant = (sum / count) * 1.1;
			
    		this.editorUi.executeLayout(function() {
    			layout.execute(graph.getDefaultParent(), graph.getSelectionCell());
    		}, true);
		}), parent);
		menu.addItem(mxResources.get('circle'), null, mxUtils.bind(this, function() {
			var layout = new mxCircleLayout(graph);
    		this.editorUi.executeLayout(function() {
    			layout.execute(graph.getDefaultParent());
    		}, true);
		}), parent);
	}))).isEnabled = isGraphEnabled;
	this.put('navigation', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.addMenuItems(menu, ['home', '-', 'exitGroup', 'enterGroup', '-', 'expand', 'collapse', '-', 'collapsible'], parent);
	})));
	this.put('arrange', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.addMenuItems(menu, ['toFront', 'toBack', '-'], parent);
		this.addSubmenu('direction', menu, parent);
		this.addMenuItems(menu, ['turn', '-'], parent);
		this.addSubmenu('align', menu, parent);
		this.addSubmenu('distribute', menu, parent);
		menu.addSeparator(parent);
		this.addSubmenu('navigation', menu, parent);
		this.addSubmenu('insert', menu, parent);
		this.addSubmenu('layout', menu, parent);
		this.addMenuItems(menu, ['-', 'group', 'ungroup', 'removeFromGroup', '-', 'autosize'], parent);
	}))).isEnabled = isGraphEnabled;
	this.put('insert', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.addMenuItems(menu, ['insertLink'], parent);
		this.addMenuItem(menu, 'image', parent).firstChild.nextSibling.innerHTML = mxResources.get('insertImage');
	})));

	this.put('view', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.addMenuItems(menu, ['outline', 'layers'].concat((this.editorUi.format != null) ? ['formatPanel'] : []), parent);
		menu.addSeparator();
		var scales = [0.25, 0.5, 0.75, 1, 1.5, 2, 4];
		
		for (var i = 0; i < scales.length; i++) {
			(function(scale) {
				menu.addItem((scale * 100) + '%', null, function() {
					graph.zoomTo(scale);
				}, parent);
			})(scales[i]);
		}
		
		this.addMenuItems(menu, ['-', 'actualSize', 'zoomIn', 'zoomOut', '-', 'fitWindow', 'fitPageWidth', 'fitPage', 'fitTwoPages', '-', 'customZoom'], parent);
	})));
	this.put('file', new Menu(mxUtils.bind(this, function(menu, parent) {
		//++--
		this.addMenuItems(menu, ['new', 'open'], parent);
		this.addSubmenu('recentOpen', menu, parent);
		//this.addMenuItems(menu, ['createRichTextsModel'], parent);
		this.addMenuItems(menu, ['save', 'saveAs'], parent);
		//this.addMenuItems(menu, ['pageSetup'], parent);
		//课程模型功能区
		var fileId = this.editor.getFileId();
		var me = this;
		if (urlParams['ui'] === 'task_design' && fileId) {
			this.communication.loadBoardUserInfo(fileId, userId, mxUtils.bind(this, function (boardUserData) {
				if (boardUserData){
					if (boardUserData.userType === 'owner') {
						me.addMenuItems(menu, ['-', 'shareBoard'], parent);
					}
				} else {
					me.addMenuItems(menu, ['-', 'shareBoard'], parent);
				}
			}));
		}
		if(fileId){
			this.addMenuItems(menu, ['-', 'setAttributes'],parent);
			urlParams = getUrlParam(window.location.href);
			if (urlParams['isInstance'] != 'true' && urlParams['ui']==='process_design'){
				this.addMenuItems(menu, ['setTopProcess', 'createInstance','manageInstance'],parent);
			}
		}
		//this.communication.getAllTopProcess(mxUtils.bind(this, function (allTopProcess) {
		//	for (var i = 0; i<allTopProcess.length; i++) {
		//		if (allTopProcess[i].id === fileId) {
		//			this.addMenuItems(menu, ['createInstance','manageInstance'], parent);
		//		}
		//	}
		//}));
		this.addMenuItems(menu, ['-'], parent);
		if(urlParams['ui'] !== 'course_design'){
			this.addSubmenu('learningResManager', menu, parent);
		}
		this.addMenuItems(menu, ['formManager'], parent);
		//this.addMenuItems(menu, ['manageRichTextsModel'], parent);
		this.addMenuItems(menu, ['-', 'print', 'import', 'export', 'editFile'], parent);
		this.addMenuItems(menu, ['-', 'logout'], parent);
	})));
	this.put('learningResManager',new Menu(mxUtils.bind(this, function(menu, parent) {
		//++--
		this.addMenuItems(menu, ['learningResEdit','learningResSearch'], parent);
	})));

	//++--
	this.put('recentOpen', new Menu(mxUtils.bind(this, function(menu, parent) {
		var files=this.getRecentOpenFileList();

		if(files[0]===undefined){
			this.getRecentOpenFileList().shift();
			console.log(this.getRecentOpenFileList());
			this.showLoadedXmlFiles(menu, files[0], null, parent);
		}else{
			if(this.getRecentOpenFileList().length>0){
				this.getRecentOpenFileList().forEach(mxUtils.bind(this, function(file){
					this.showLoadedXmlFiles(menu, file, null, parent);
				}));
			}else{
				this.showLoadedXmlFiles(menu, files[0], null, parent);
			}
		}
		//for(var i = 0; i < 10; i++){
        //
		//	this.showLoadedXmlFiles(menu, 'file' + i + '.xml', null, parent);
		//}
	})));
	this.put('edit', new Menu(mxUtils.bind(this, function(menu, parent) {
		//this.addMenuItems(menu, ['undo', 'redo', '-', 'cut', 'copy', 'paste', 'delete', '-', 'duplicate', '-',
		//                         'editData', 'editTooltip', 'editStyle', '-', 'editLink', 'openLink', '-', 'selectVertices',
		//                         'selectEdges', 'selectAll', '-', 'lockUnlock']);
		this.addMenuItems(menu, ['undo', 'redo', '-', 'delete','copy', 'duplicate', 'paste', 'cut', '-',
								'selectAll', 'lockUnlock', '-',
								'editTooltip',  'editLink','editStyle','editData','-',
								((mxUi === 'subject_design') ? 'editChapterProperty' : 'editProperty')]);
	})));
	this.put('options', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.addMenuItems(menu, ['pageView', '-', 'grid', 'guides', '-', 'scrollbars', 'tooltips', '-',
 		                         'connectionPoints', 'copyConnect', 'navigation', '-', 'pageBackgroundColor', 'autosave']);
	})));
    if(isStartProcessEngine){
        this.put('run', new Menu(mxUtils.bind(this, function(menu, parent) {
            this.addMenuItems(menu, ['startDebug', 'runProcess', 'stopDebug']);
        })));
    }

	this.put('help', new Menu(mxUtils.bind(this, function(menu, parent) {
		this.addMenuItems(menu, ['help', '-', 'about']);
	})));
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.put = function(name, menu) {
	this.menus[name] = menu;
	
	return menu;
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.get = function(name) {
	return this.menus[name];
};

/**
 * Adds the given submenu.
 */
Menus.prototype.addSubmenu = function(name, menu, parent) {
	var enabled = this.get(name).isEnabled();
	
	if (menu.showDisabled || enabled) {
		var submenu = menu.addItem(mxResources.get(name), null, null, parent, null, enabled);
		this.addMenu(name, menu, submenu);
	}
};

/**
 * Adds the label menu items to the given menu and parent.
 */
Menus.prototype.addMenu = function(name, popupMenu, parent) {
	var menu = this.get(name);
	
	if (menu != null && (popupMenu.showDisabled || menu.isEnabled())) {
		this.get(name).execute(popupMenu, parent);
	}
};

/**
 * Adds a menu item to insert a table.
 */
Menus.prototype.addInsertTableItem = function(menu) {
	// KNOWN: Does not work in IE8 standards and quirks
	var graph = this.editorUi.editor.graph;
	
	function createTable(rows, cols) {
		var html = ['<table>'];
		
		for (var i = 0; i < rows; i++) {
			html.push('<tr>');
			
			for (var j = 0; j < cols; j++) {
				html.push('<td><br></td>');
			}
			
			html.push('</tr>');
		}
		
		html.push('</table>');
		
		return html.join('');
	};
	
	// Show table size dialog
	var elt2 = menu.addItem('', null, mxUtils.bind(this, function(evt) {
		var td = graph.getParentByName(mxEvent.getSource(evt), 'TD');
		
		if (td != null) {
			var row2 = graph.getParentByName(td, 'TR');
			
			// To find the new link, we create a list of all existing links first
    		// LATER: Refactor for reuse with code for finding inserted image below
			var tmp = graph.cellEditor.text2.getElementsByTagName('table');
			var oldTables = [];
			
			for (var i = 0; i < tmp.length; i++) {
				oldTables.push(tmp[i]);
			}
			
			// Finding the new table will work with insertHTML, but IE does not support that
			graph.container.focus();
			graph.pasteHtmlAtCaret(createTable(row2.sectionRowIndex + 1, td.cellIndex + 1));
			
			// Moves cursor to first table cell
			var newTables = graph.cellEditor.text2.getElementsByTagName('table');
			
			if (newTables.length == oldTables.length + 1) {
				// Inverse order in favor of appended tables
				for (var i = newTables.length - 1; i >= 0; i--) {
					if (i == 0 || newTables[i] != oldTables[i - 1]) {
						graph.selectNode(newTables[i].rows[0].cells[0]);
						break;
					}
				}
			}
		}
	}));
	
	// Quirks mode does not add cell padding if cell is empty, needs good old spacer solution
	var quirksCellHtml = '<img src="' + mxClient.imageBasePath + '/transparent.gif' + '" width="16" height="16"/>';

	function createPicker(rows, cols) {
		var table2 = document.createElement('table');
		table2.setAttribute('border', '1');
		table2.style.borderCollapse = 'collapse';

		if (!mxClient.IS_QUIRKS) {
			table2.setAttribute('cellPadding', '8');
		}
		
		for (var i = 0; i < rows; i++) {
			var row = table2.insertRow(i);
			
			for (var j = 0; j < cols; j++) {
				var cell = row.insertCell(-1);
				
				if (mxClient.IS_QUIRKS) {
					cell.innerHTML = quirksCellHtml;
				}
			}
		}
		
		return table2;
	};

	function extendPicker(picker, rows, cols) {
		for (var i = picker.rows.length; i < rows; i++) {
			var row = picker.insertRow(i);
			
			for (var j = 0; j < picker.rows[0].cells.length; j++) {
				var cell = row.insertCell(-1);
				
				if (mxClient.IS_QUIRKS) {
					cell.innerHTML = quirksCellHtml;
				}
			}
		}
		
		for (var i = 0; i < picker.rows.length; i++) {
			var row = picker.rows[i];
			
			for (var j = row.cells.length; j < cols; j++) {
				var cell = row.insertCell(-1);
				
				if (mxClient.IS_QUIRKS) {
					cell.innerHTML = quirksCellHtml;
				}
			}
		}
	};
	
	elt2.firstChild.innerHTML = '';
	var picker = createPicker(5, 5);
	elt2.firstChild.appendChild(picker);
	
	var label = document.createElement('div');
	label.style.padding = '4px';
	label.style.fontSize = Menus.prototype.defaultFontSize + 'px';
	label.innerHTML = '1x1';
	elt2.firstChild.appendChild(label);
	
	mxEvent.addListener(picker, 'mouseover', function(e) {
		var td = graph.getParentByName(mxEvent.getSource(e), 'TD');
		
		if (td != null) {
			var row2 = graph.getParentByName(td, 'TR');
			extendPicker(picker, Math.min(20, row2.sectionRowIndex + 2), Math.min(20, td.cellIndex + 2));
			label.innerHTML = (td.cellIndex + 1) + 'x' + (row2.sectionRowIndex + 1);
			
			for (var i = 0; i < picker.rows.length; i++) {
				var r = picker.rows[i];
				
				for (var j = 0; j < r.cells.length; j++) {
					var cell = r.cells[j];
					
					if (i <= row2.sectionRowIndex && j <= td.cellIndex) {
						cell.style.backgroundColor = 'blue';
					}
					else {
						cell.style.backgroundColor = 'white';
					}
				}
			}
			
			mxEvent.consume(e);
		}
	});
};

/**
 * Adds a style change item to the given menu.
 */
Menus.prototype.edgeStyleChange = function(menu, label, keys, values, sprite, parent, reset) {
	return menu.addItem(label, null, mxUtils.bind(this, function() {
		var graph = this.editorUi.editor.graph;
		graph.stopEditing(false);
		
		graph.getModel().beginUpdate();
		try {
			var cells = graph.getSelectionCells();
			var edges = [];
			
			for (var i = 0; i < cells.length; i++) {
				var cell = cells[i];
				
				if (graph.getModel().isEdge(cell)) {
					if (reset) {
						var geo = graph.getCellGeometry(cell);
			
						// Resets all edge points
						if (geo != null) {
							geo = geo.clone();
							geo.points = null;
							graph.getModel().setGeometry(cell, geo);
						}
					}
					
					for (var j = 0; j < keys.length; j++) {
						graph.setCellStyles(keys[j], values[j], [cell]);
					}
					
					edges.push(cell);
				}
			}
			
			this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', keys,
				'values', values, 'cells', edges));
		}
		finally {
			graph.getModel().endUpdate();
		}
	}), parent, sprite);
};

/**
 * Adds a style change item to the given menu.
 */
Menus.prototype.styleChange = function(menu, label, keys, values, sprite, parent, fn) {
	var apply = this.createStyleChangeFunction(keys, values);
	
	return menu.addItem(label, null, mxUtils.bind(this, function() {
		var graph = this.editorUi.editor.graph;
		
		if (fn != null && graph.cellEditor.isContentEditing()) {
			fn();
		}
		else {
			apply();
		}
	}), parent, sprite);
};

Menus.prototype.showLoadedXmlFiles = function(menu, file, sprite, parent) {
	//var fileName = file.fileName;
	if(file!==undefined){
		if(file.fileName){
			return menu.addItem(file.fileName, null, mxUtils.bind(this, function() {
				//alert(label);
				//++ ajax load graph xml file
				//this.communication.retrieveGraphModel({gFileId:file.gFileId}, mxUtils.bind(this.editor, this.editor.setGraphModel));
                //this.editorUi.editor.setModified(false);
                var queryObj = appUtils.convertQueryStrToJSON();
                queryObj.gFileId = file.gFileId;
                History.pushState(queryObj, this.editorUi.communication.apis.retrieveGraphModel, appUtils.convertJSONToQueryStr(queryObj, '?'));


                this.updateRecentOpenFileList(file);

			}), parent, sprite);
		}
	}else{
		var title=mxResources.get('noRecentOpen');
		return menu.addItem(title, null, mxUtils.bind(this, function() {

		}), parent, sprite);
	}

};

/**
 * 
 */
Menus.prototype.createStyleChangeFunction = function(keys, values) {
	return mxUtils.bind(this, function() {
		var graph = this.editorUi.editor.graph;
		graph.stopEditing(false);
		
		graph.getModel().beginUpdate();
		try {
			for (var i = 0; i < keys.length; i++) {
				graph.setCellStyles(keys[i], values[i]);
			}
			
			this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', keys, 'values', values,
				'cells', graph.getSelectionCells()));
		}
		finally {
			graph.getModel().endUpdate();
		}
	});
};

/**
 * Adds a style change item with a prompt to the given menu.
 */
Menus.prototype.promptChange = function(menu, label, hint, defaultValue, key, parent, enabled, fn, sprite) {
	return menu.addItem(label, null, mxUtils.bind(this, function() {
		var graph = this.editorUi.editor.graph;
		var value = defaultValue;
    	var state = graph.getView().getState(graph.getSelectionCell());
    	
    	if (state != null) {
    		value = state.style[key] || value;
    	}
    	
		var dlg = new FilenameDialogBody2(this.editorUi, value, mxResources.get('apply'), mxUtils.bind(this, function(newValue) {
			if (newValue != null && newValue.length > 0) {
				graph.getModel().beginUpdate();
				try {
					graph.stopEditing(false);
					graph.setCellStyles(key, newValue);
				}
				finally {
					graph.getModel().endUpdate();
				}
				
				if (fn != null) {
					fn(newValue);
				}
			}
		}), mxResources.get('enterValue') + ((hint.length > 0) ? (' ' + hint) : ''));
		this.editorUi.showDialog(dlg, 300, 80, true, true);
		dlg.init();
	}), parent, sprite, enabled);
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Menus.prototype.pickColor = function(key, cmd, defaultValue) {
	var graph = this.editorUi.editor.graph;
	
	if (cmd != null && graph.cellEditor.isContentEditing()) {
		var selState = graph.cellEditor.saveSelection();
		
		var dlg = new ColorDialog(this.editorUi, defaultValue || '000000', mxUtils.bind(this, function(color) {
			graph.cellEditor.restoreSelection(selState);
			document.execCommand(cmd, false, (color != mxConstants.NONE) ? color : 'transparent');
		}), function() {
			graph.cellEditor.restoreSelection(selState);
		});
		this.editorUi.showDialog(dlg, 220, 400, true, true);
		dlg.init();
	}
	else {
		if (this.colorDialog == null) {
			this.colorDialog = new ColorDialog(this.editorUi);
		}
	
		this.colorDialog.currentColorKey = key;
		var state = graph.getView().getState(graph.getSelectionCell());
		var color = 'none';
		
		if (state != null) {
			color = state.style[key] || color;
		}
		
		if (color == 'none') {
			color = 'ffffff';
			this.colorDialog.picker.fromString('ffffff');
			this.colorDialog.colorInput.value = 'none';
		}
		else {
			this.colorDialog.picker.fromString(color);
		}
	
		this.editorUi.showDialog(this.colorDialog, 220, 400, true, true);
		this.colorDialog.init();
	}
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Menus.prototype.toggleStyle = function(key, defaultValue) {
	var graph = this.editorUi.editor.graph;
	var value = graph.toggleCellStyles(key, defaultValue);
	this.editorUi.fireEvent(new mxEventObject('styleChanged', 'keys', [key], 'values', [value],
			'cells', graph.getSelectionCells()));
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.addMenuItem = function(menu, key, parent, trigger, sprite) {
	var action = this.editorUi.actions.get(key);

	if (action != null && (menu.showDisabled || action.isEnabled()) && action.visible) {
		var item = menu.addItem(action.label, null, function() {
			action.funct(trigger);
		}, parent, sprite, action.isEnabled());
		
		// Adds checkmark image
		if (action.toggleAction && action.isSelected()) {
			this.addCheckmark(item);
		}

		this.addShortcut(item, action);
		
		return item;
	}
	
	return null;
};

/**
 * Adds a checkmark to the given menuitem.
 */
Menus.prototype.addShortcut = function(item, action) {
	if (action.shortcut != null) {
		var td = item.firstChild.nextSibling.nextSibling;
		var span = document.createElement('span');
		span.style.color = 'gray';
		mxUtils.write(span, action.shortcut);
		td.appendChild(span);
	}
};

/**
 * Adds a checkmark to the given menuitem.
 */
Menus.prototype.addCheckmark = function(item) {
	var td = item.firstChild.nextSibling;
	td.style.backgroundImage = 'url(' + IMAGE_PATH + '/checkmark.gif)';
	td.style.backgroundRepeat = 'no-repeat';
	td.style.backgroundPosition = '2px 50%';
};

/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.addMenuItems = function(menu, keys, parent, trigger, sprites) {
	for (var i = 0; i < keys.length; i++) {
		if (keys[i] == '-') {
			menu.addSeparator(parent);
		}
		else {
			this.addMenuItem(menu, keys[i], parent, trigger, (sprites != null) ? sprites[i] : null);
		}
	}
};

/**
 * Build a popup menu for the graph
 * @param menu
 * @param cell
 * @param evt
 */
Menus.prototype.createGraphPopupMenu = function(menu, cell, evt) {
	var graph = this.graph;
	menu.smartSeparators = true;
	
	if (graph.isSelectionEmpty()) {
		this.addMenuItems(menu, ['undo', 'redo', '-', 'paste'], null, evt);	
	}
	else {
		//移至功能区下面
		//this.addMenuItems(menu, ['delete', '-', 'copy', 'duplicate', 'cut'], null, evt);

	}
	//0316fz
	//if (graph.getSelectionCount() == 1) {
	//	this.addMenuItems(menu, ['setAsDefaultStyle'], null, evt);
    //
	//}
	
	menu.addSeparator();
	
	if (graph.getSelectionCount() > 0) {
		var cell = graph.getSelectionCell();
		var state = graph.view.getState(cell);
		
		if (state != null) {
			//task功能区
			if (graph.getSelectionCount() == 1) {
				menu.addSeparator();
				//this.addMenuItems(menu, ['editLink'], null, evt);
				if (urlParams['ui'] === 'task_design') {
					this.addMenuItems(menu, ['comment'], null, evt);
				}
				//this.addMenuItems(menu, ['describeInstance'],null,evt);
				//this.addMenuItems(menu, ['videoEdit'],null,evt);
				//this.addMenuItems(menu, ['chooseCondition'], null, evt);
				//this.addMenuItems(menu, ['describeEditProperty'],null,evt);
				var cellType = cell.getAttribute('type');
				if (cellType === 'bpmn.data.object') {
					this.addMenuItems(menu, ['editObjectData'], null, evt);
				} else {
					if(cellType){
						var taskTypeSeges = cellType.split('.');
						if(taskTypeSeges[1] == 'task' || cellType == 'bpmn.subprocess.ectask' || cellType == 'bpmn.gateway.general.end'){
							this.addMenuItems(menu, [((mxUi === 'subject_design') ? 'editChapterProperty' : 'editProperty')], null, evt);
						}
					}
				}
				var cellSubProcess = cell.getAttribute('subProcessId');
				//if(cellType){
				//	var cellTypeSegs = cellType.split('.');
				//	if(cellTypeSegs.length > 1 && cellTypeSegs[0] + '.' + cellTypeSegs[1] === 'bpmn.subprocess'){
				//		this.addMenuItems(menu, ['editSubProcess'], null, evt);
				//		if (cellSubProcess && cellSubProcess !== 'null') {
				//			this.addMenuItems(menu, ['separateSubProcess'], null, evt);
				//		}
				//	}
				//}
				if(cellType){
					var cellTypeSegs = cellType.split('.');
					if(cellTypeSegs.length > 1 && cellTypeSegs[0] + '.' + cellTypeSegs[1]+ '.' + cellTypeSegs[2] === 'bpmn.subprocess.call'){
						this.addMenuItems(menu, ['editSubProcess'], null, evt);
						if (cellSubProcess && cellSubProcess !== 'null') {
							this.addMenuItems(menu, ['separateSubProcess'], null, evt);
						}
					}
				}
				this.addMenuItems(menu, ['editData'], null, evt);
				var sourceCell = cell.source;

				if(sourceCell){
					var gateType = sourceCell.getAttribute('type');
					var gateTypeSeges = gateType.split('.');
					if(gateTypeSeges.length == 3 && (gateTypeSeges[1] == 'gateway')){
						this.addMenuItems(menu, ['chooseCondition'], null, evt);
					}
				}


				// Shows edit image action if there is an image in the style
				if (graph.getModel().isVertex(cell) && mxUtils.getValue(state.style, mxConstants.STYLE_IMAGE, null) != null) {
					menu.addSeparator();
					this.addMenuItem(menu, 'image', null, evt).firstChild.nextSibling.innerHTML = mxResources.get('editImage') + '...';
				}
			}
			//图形操作
			this.addMenuItems(menu, ['-', 'delete','copy', 'duplicate', 'cut'], null, evt);
			this.addMenuItems(menu, ['-', 'toFront', 'toBack'], null, evt);
	
			if (graph.getModel().isEdge(cell) && mxUtils.getValue(state.style, mxConstants.STYLE_EDGE, null) != 'entityRelationEdgeStyle' &&
				mxUtils.getValue(state.style, mxConstants.STYLE_SHAPE, null) != 'arrow') {
				var handler = graph.selectionCellsHandler.getHandler(cell);
				var isWaypoint = false;
				if (handler instanceof mxEdgeHandler && handler.bends != null && handler.bends.length > 2) {
					var index = handler.getHandleForEvent(graph.updateMouseEvent(new mxMouseEvent(evt)));
					
					// Configures removeWaypoint action before execution
					// Using trigger parameter is cleaner but have to find waypoint here anyway.
					var rmWaypointAction = this.editorUi.actions.get('removeWaypoint');
					rmWaypointAction.handler = handler;
					rmWaypointAction.index = index;

					isWaypoint = index > 0 && index < handler.bends.length - 1;
				}
				
				this.addMenuItems(menu, ['-', (isWaypoint) ? 'removeWaypoint' : 'addWaypoint'], null, evt);
				// Adds reset waypoints option if waypoints exist
				var geo = graph.getModel().getGeometry(cell);
				
				if (geo != null && geo.points != null && geo.points.length > 0) {
					this.addMenuItems(menu, ['clearWaypoints'], null, evt);	
				}
			}

			if (graph.getSelectionCount() > 1)	 {
				this.addMenuItems(menu, ['group'], null, evt);
			}
			else if (graph.getSelectionCount() == 1 && !graph.getModel().isEdge(cell) && !graph.isSwimlane(cell) &&
					graph.getModel().getChildCount(cell) > 0) {
				this.addMenuItems(menu, ['ungroup'], null, evt);
			}
			if(urlParams['ui'] === 'task_design'){
				if(graph.getSelectionCount() > 1) {
					menu.addSeparator();
					this.addMenuItems(menu,['merge'],null,evt);
				}
				if(graph.getSelectionCount() == 1) {
					menu.addSeparator();
					this.addMenuItems(menu,['unmerge'],null,evt);
				}
			}

		}
	}
	else {
		var fileId = this.editor.getFileId();
		var me = this;
		if (urlParams['ui'] === 'task_design' && fileId) {
			this.communication.loadBoardUserInfo(fileId, userId, mxUtils.bind(this, function (boardUserData) {
				if (boardUserData){
					if (boardUserData.userType === 'owner') {
						me.addMenuItems(menu, ['-', 'shareBoard'], null, evt);
					}
				} else {
					me.addMenuItems(menu, ['-', 'shareBoard'], null, evt);
				}
			}));
		}
		//this.addMenuItems(menu, ['selectVertices', 'selectEdges', 'selectAll'], null, evt);
		this.addMenuItems(menu, ['selectAll'], null, evt);
		if(fileId){
			this.addMenuItems(menu, ['-', 'setAttributes'], null, evt);
			urlParams = getUrlParam(window.location.href);
			if (urlParams['isInstance'] != 'true' && urlParams['ui']==='process_design'){
				this.addMenuItems(menu, ['-', 'setTopProcess', 'createInstance','manageInstance'], null, evt);
			}
		}
		//this.communication.getAllTopProcess(mxUtils.bind(this, function (allTopProcess) {
		//	for (var i = 0; i<allTopProcess.length; i++) {
		//		if (allTopProcess[i].id === fileId) {
		//			this.addMenuItems(menu, ['createInstance'], null, evt);
		//			this.addMenuItems(menu, ['manageInstance'], null, evt);
		//		}
		//	}
		//}));
	}
};
/**
 * Creates the keyboard event handler for the current graph and history.
 */
Menus.prototype.createMenubar = function(container) {
	var menubar = new Menubar(this.editorUi, container);
	var menus = ['file', 'edit', 'view', 'format', 'text', 'arrange', 'options'];
	if(isStartProcessEngine){
        menus = menus.concat(['run']);
    }
    menus = menus.concat(['help']);

	for (var i = 0; i < menus.length; i++) {
		(function(menu) {
			var elt = menubar.addMenu(mxResources.get(menus[i]), menu.funct);
			
			if (elt != null) {
				menu.addListener('stateChanged', function() {
					elt.enabled = menu.enabled;
					
					if (!menu.enabled) {
						elt.className = 'geItem mxDisabled';
						
						if (document.documentMode == 8) {
							elt.style.color = '#c3c3c3';
						}
					}
					else {
						elt.className = 'geItem';
						
						if (document.documentMode == 8) {
							elt.style.color = '';
						}
					}
				});
			}
		})(this.get(menus[i]));
	}

	return menubar;
};

/**
 * update recently opened files.
 * Max length = 10
 */
var addCookie = function (name, value, expiresHours) {
	var cookieString = name + "=" + escape(value);
	if (expiresHours > 0) {
		var date = new Date();
		date.setTime(date.getTime + expiresHours * 3600 * 1000);
		cookieString = cookieString + "; expires=" + date.toGMTString();
	}
	document.cookie = cookieString;
};
var getCookie = function (name) {
	var strCookie = document.cookie;
	var arrCookie = strCookie.split("; ");
	for (var i = 0; i < arrCookie.length; i++) {
		var arr = arrCookie[i].split("=");
		if (arr[0] == name) {
			return arr[1];
		}
	}
	return "";

};
var deleteCookie = function (name) {
	var date = new Date();
	date.setTime(date.getTime() - 10000);
	document.cookie = name + "=v; expires=" + date.toGMTString();
};
Menus.prototype.updateRecentOpenFileList = function(file){
	// xihao|fangzhou todo[dev]
	// Store the recent opened files in cookies
	if(file===undefined){
		var recent=unescape(getCookie('recentOpenedFiles'));
		//console.log(recent);
		var arr=recent.split('!');
		//console.log(arr);
		if(recent!==''){
			for(var i=0;i<arr.length-1;i++){
				//console.log(JSON.parse(arr[i]));
				this.recentOpenedFiles.push(JSON.parse(arr[i]));
			}
		}
		console.log(this.recentOpenedFiles);
	}

	if(file!==undefined){

		var index=-1;
		for(var i=0;i<this.recentOpenedFiles.length;i++){
			if(file.gFileId===this.recentOpenedFiles[i].gFileId){
				index=i;
				break;
			}
		}
		if(index!==-1){
			console.log(this.recentOpenedFiles);
			//this.recentOpenedFiles.splice(index,1);
			var temp=this.recentOpenedFiles[index];
			for(var i=index;i>0;i--){
				this.recentOpenedFiles[i]=this.recentOpenedFiles[i-1];
			}
			this.recentOpenedFiles.shift();
			this.recentOpenedFiles.unshift(file);
			console.log(this.recentOpenedFiles);
		}else{
			if(this.recentOpenedFiles.length===10){
				this.recentOpenedFiles.pop();
				this.recentOpenedFiles.unshift(file);
			}else{
				this.recentOpenedFiles.unshift(file);
			}
		}

		deleteCookie('recentOpenedFiles');
		var str='';
		for(var i=0;i<this.recentOpenedFiles.length;i++){
			str=str+JSON.stringify(this.recentOpenedFiles[i])+'!';
		}
		//console.log(str);
		addCookie('recentOpenedFiles',str,0);
	}
};
Menus.prototype.getRecentOpenFileList = function(){
	return this.recentOpenedFiles;
};


/**
 * Construcs a new menubar for the given editor.
 */
function Menubar(editorUi, container) {
	this.editorUi = editorUi;
	this.container = container;
	
	// Global handler to hide the current menu
	mxEvent.addGestureListeners(document, mxUtils.bind(this, function(evt) {
		if (this.currentMenu != null && mxEvent.getSource(evt) != this.currentMenu.div) {
			this.hideMenu();
		}
	}));
};

/**
 * Adds the menubar elements.
 */
Menubar.prototype.hideMenu = function() {
	if (this.currentMenu != null) {
		this.currentMenu.hideMenu();
	}
};

/**
 * Adds a submenu to this menubar.
 */
Menubar.prototype.addMenu = function(label, funct) {
	var elt = document.createElement('a');
	elt.setAttribute('href', 'javascript:void(0);');
	elt.className = 'geItem';
	mxUtils.write(elt, label);

	this.addMenuHandler(elt, funct);
	this.container.appendChild(elt);
	
	return elt;
};

/**
 * Adds a handler for showing a menu in the given element.
 */
Menubar.prototype.addMenuHandler = function(elt, funct) {
	if (funct != null) {
		var show = true;
		
		var clickHandler = mxUtils.bind(this, function(evt) {
			if (show && elt.enabled == null || elt.enabled) {
				this.editorUi.editor.graph.popupMenuHandler.hideMenu();
				var menu = new mxPopupMenu(funct);
				menu.div.className += ' geMenubarMenu';
				menu.smartSeparators = true;
				menu.showDisabled = true;
				menu.autoExpand = true;
				
				// Disables autoexpand and destroys menu when hidden
				menu.hideMenu = mxUtils.bind(this, function() {
					mxPopupMenu.prototype.hideMenu.apply(menu, arguments);
					menu.destroy();
					this.currentMenu = null;
					this.currentElt = null;
				});

				var offset = mxUtils.getOffset(elt);
				menu.popup(offset.x, offset.y + elt.offsetHeight, null, evt);
				this.currentMenu = menu;
				this.currentElt = elt;
			}
			
			mxEvent.consume(evt);
		});
		
		// Shows menu automatically while in expanded state
		mxEvent.addListener(elt, 'mousemove', mxUtils.bind(this, function(evt) {
			if (this.currentMenu != null && this.currentElt != elt) {
				this.hideMenu();
				clickHandler(evt);
			}
		}));

		// Hides menu if already showing
		mxEvent.addListener(elt, 'mousedown', mxUtils.bind(this, function() {
			show = this.currentElt != elt;
		}));
		
		mxEvent.addListener(elt, 'click', mxUtils.bind(this, function(evt) {
			clickHandler(evt);
			show = true;
		}));
	}
};

/**
 * Constructs a new action for the given parameters.
 */
function Menu(funct, enabled) {
	mxEventSource.call(this);
	this.funct = funct;
	this.enabled = (enabled != null) ? enabled : true;
};

// Menu inherits from mxEventSource
mxUtils.extend(Menu, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Menu.prototype.isEnabled = function() {
	return this.enabled;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Menu.prototype.setEnabled = function(value) {
	if (this.enabled != value) {
		this.enabled = value;
		this.fireEvent(new mxEventObject('stateChanged'));
	}
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Menu.prototype.execute = function(menu, parent) {
	this.funct(menu, parent);
};
