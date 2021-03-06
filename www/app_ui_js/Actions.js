/**
 * Constructs the actions object for the given UI.
 */
function Actions(editorUi) {
    this.editorUi = editorUi;
    this.actions = new Object();
    this.init();
};

/**
 * Adds the default actions.
 */
Actions.prototype.init = function () {
    var ui = this.editorUi;
    var editor = ui.editor;
    var graph = editor.graph;
    var isGraphEnabled = mxUtils.bind(graph, graph.isEnabled);

    // File actions
    this.addAction('new', function () {
        window.open(ui.getBlankUrl());
    });
    this.addAction('open', function () {
        var lockType = (mxUi==='process_design')?'10100':'11000';
        ui.showAllFiles(null,null,null, lockType,mxUi);
    }, null, null, 'Ctrl+O');
    //this.addAction('recentOpen...', function () {
    //    //++
    //    alert(1);
    //});
    this.addAction('import', function () {
        window.openNew = false;
        window.openKey = 'import';

        // Closes dialog after open
        window.openFile = new OpenFile(mxUtils.bind(this, function () {
            ui.hideDialog();
        }));

        window.openFile.setConsumer(mxUtils.bind(this, function (xml, filename) {
            try {
                var doc = mxUtils.parseXml(xml);
                var model = new mxGraphModel();
                var codec = new mxCodec(doc);
                codec.decode(doc.documentElement, model);

                var children = model.getChildren(model.getChildAt(model.getRoot(), 0));
                editor.graph.setSelectionCells(editor.graph.importCells(children));
            }
            catch (e) {
                mxUtils.alert(mxResources.get('invalidOrMissingFile') + ': ' + e.message);
            }
        }));

        // Removes openFile if dialog is closed
        ui.showDialog(new ImportDialogBody(mxResources.get('import')), 320, null, true, true, function () {
            window.openFile = null;
        });
    }).isEnabled = isGraphEnabled;

    this.addAction('learningResSearch...', function () {
        ui.showAllLearningResource('learningResSearch',null,null,null,'00011');
    });
    this.addAction('formManager', function () {
        var formManageDialogBody = new FormManageDialogBody(ui, userId);
        ui.showDialog(formManageDialogBody, 880, 650, true, true);
    });

    /*this.addAction('createRichTextsModel', function () {
        ui.createOrEditRichTextsModel(function(){
        });
    });*/
    //弃用20160316
    //this.addAction('manageRichTextsModel', function () {
    //    ui.showAllRichTextsModel('manageRichTextsModel',null,null,'10001');
    //
    //});

    this.addAction('learningResEdit...', function () {
        ui.editLearningResource('learningResEdit');
        ui.flag = true;
    });

    this.addAction('renameLearningRes', mxUtils.bind(this, function () {
        var fileEntityBox = this.editorUi.currentSeletedFiles[0];
        if(fileEntityBox){
            var fileEntity = fileEntityBox.getFileEntity();
            ui.renameLR(fileEntity, function(fileEntity){
                fileEntityBox.setFileName(fileEntity.fileName);
            });
        }
    }, null, null, null));
    this.addAction('deleteLearningRes', mxUtils.bind(this, function () {
        var fileEntityBox = this.editorUi.currentSeletedFiles[0];
        var fileEntityBoxList = this.editorUi.selectFilesList;
        var fileEntity = fileEntityBox.getFileEntity();
        /*
        if(fileEntity){
           ui.showLearningResource(fileEntity);
        }
        */
        if (fileEntityBoxList.length > 1) {
            var count = 1;
            ui.delAllResFiles(mxResources.get('okToDelete'), fileEntityBoxList, function () {
                    if(count){
                        for (var j = 0; j < fileEntityBoxList.length; j++) {
                            fileEntityBoxList[j].removeMe();
                        }
                        count = 0;
                    }
            });
        } else if (fileEntityBox) {
            ui.deleteLR(mxResources.get('okToDelete') + '\r\n' + fileEntity.fileName, fileEntity, function () {
                fileEntityBox.removeMe();
            });
        }

    }, null, null, null));

    this.addAction('videoEdit...', function () {
        ui.editVideo();
    });

    this.addAction('save', function () {
        //区别course和 sub course
        if (mxUi==='process_design') {
            if (ui.editor.filename){
                ui.updateInstance();
            } else {
                ui.createSubCourse();
            }
        } else {
            ui.saveModelFile(false);
        }
    }, null, null, 'Ctrl+S').isEnabled = isGraphEnabled;
    this.addAction('saveAs', function () {
        //区别course和 sub course
        if (mxUi==='process_design') {
            ui.createSubCourse();
        } else {
            ui.saveModelFile(true);
        }
    }, null, null, 'Ctrl+Shift+S').isEnabled = isGraphEnabled;
    this.addAction('export', function () {
        ui.showDialog(new ExportDialogBody(ui, mxResources.get('export')), 400, null, true, true);
    });
    this.put('editFile', new Action(mxResources.get('editSource'), function () {
        ui.showDialog(new EditFileDialogBody(ui, mxResources.get('editSource')), 620, null, true, true);
    })).isEnabled = isGraphEnabled;
    this.addAction('pageSetup', function () {
        ui.showDialog(new PageSetupDialogBody(ui, mxResources.get('pageSetup')), 320, null, true, true);
    });
    this.addAction('print', function () {
        ui.showDialog(new PrintDialogBody(ui, mxResources.get('print')), 300, null, true, true);
    }, null, 'sprite-print', 'Ctrl+P');
    this.addAction('preview', function () {
        mxUtils.show(graph, null, 10, 10);
    });
    this.addAction('logout', function () {
        var queryObj = appUtils.convertQueryStrToJSON();
        console.log(queryObj);
        if(mxUi === 'task_design' && urlParams['ch']){
            var chatBox = ui.chatDiv;
            var chatHistory = chatBox.getChatInfo();
            if(chatHistory && !queryObj.gFileId){
                var message = mxResources.get('lChatHistoryLeftSaveItBeforeLeaving');
                var tipDialog = new logoutTipDialogBody(ui,message);
                ui.showDialog(tipDialog, 340, null, true, true);
            }else if(chatHistory && queryObj.gFileId){
                ui.saveModelFile(false);
                window.location = '/logout?apiKey='+apiKey;
            } else {
                var query = {
                    'name':userName,
                    'id':userId
                };
                appSocket.emit('logout',query);
                window.location = '/logout?apiKey='+apiKey;
            }
        }else{
            window.location = '/logout?apiKey='+apiKey;
        }
    });
    // Edit actions
    this.addAction('undo', function () {
        ui.undo();
    }, null, 'sprite-undo', 'Ctrl+Z');
    this.addAction('redo', function () {
        ui.redo();
    }, null, 'sprite-redo', 'Ctrl+Y');
    this.addAction('cut', function () {
        mxClipboard.cut(graph);
    }, null, 'sprite-cut', 'Ctrl+X');
    this.addAction('copy', function () {
        mxClipboard.copy(graph);
    }, null, 'sprite-copy', 'Ctrl+C');
    this.addAction('paste', function () {
        mxClipboard.paste(graph);
    }, false, 'sprite-paste', 'Ctrl+V');
    this.addAction('delete', function () {
        // Handles special case where delete is pressed while connecting
        if (graph.connectionHandler.isConnecting()) {
            graph.connectionHandler.reset();
        }
        else {
            var cells = graph.getSelectionCells();
            var parents = graph.model.getParents(cells);
            graph.removeCells(cells);
            for(var i = 0; i < cells.length;i++) {
                var queryObj = {
                    fileId: editor.getFileId(),
                    taskId : cells[i]['id']
                };
                ui.communication.removeCommentsOfTask(queryObj,function(){
                    console.log(mxResources.get('allCommentDeleted', queryObj.taskId));
                });
            }
            // Selects parents for easier editing of groups
            if (parents != null) {
                var select = [];

                for (var i = 0; i < parents.length; i++) {
                    if (graph.model.isVertex(parents[i]) || graph.model.isEdge(parents[i])) {
                        select.push(parents[i]);
                    }
                }

                graph.setSelectionCells(select);
            }
        }
    }, null, null, 'Delete');
    this.addAction('duplicate', function () {
        graph.setSelectionCells(graph.duplicateCells());
    }, null, null/*, 'Ctrl+D'*/);
    this.addAction('turn', function () {
        graph.setSelectionCells(graph.turnShapes(graph.getSelectionCells()));
    }, null, null, 'Ctrl+R');
    this.addAction('selectVertices', function () {
        graph.selectVertices();
    }, null, null, 'Ctrl+Shift+A').isEnabled = isGraphEnabled;
    this.addAction('selectEdges', function () {
        graph.selectEdges();
    }, null, null, 'Ctrl+Shift+E').isEnabled = isGraphEnabled;
    this.addAction('selectAll', function () {
        graph.selectAll();
    }, null, null, 'Ctrl+A').isEnabled = isGraphEnabled;
    this.addAction('lockUnlock', function () {
        graph.getModel().beginUpdate();
        try {
            graph.toggleCellStyles(mxConstants.STYLE_RESIZABLE, 1);
            graph.toggleCellStyles(mxConstants.STYLE_MOVABLE, 1);
            graph.toggleCellStyles(mxConstants.STYLE_ROTATABLE, 1);
        }
        finally {
            graph.getModel().endUpdate();
        }
    }, null, null, 'Ctrl+L');

    // Navigation actions
    this.addAction('home', function () {
        graph.home();
    }, null, null, 'Home');
    this.addAction('exitGroup', function () {
        graph.exitGroup();
    }, null, null, 'Ctrl+Shift+Page Up');
    this.addAction('enterGroup', function () {
        graph.enterGroup();
    }, null, null, 'Ctrl+Shift+Page Down');
    this.addAction('expand', function () {
        graph.foldCells(false);
    }, null, null, 'Ctrl+Page Down');
    this.addAction('collapse', function () {
        graph.foldCells(true);
    }, null, null, 'Ctrl+Page Up');

    // Arrange actions
    this.addAction('toFront', function () {
        graph.orderCells(false);
    }, null, null, 'Ctrl+Shift+F');
    this.addAction('toBack', function () {
        graph.orderCells(true);
    }, null, null, 'Ctrl+B');
    this.addAction('group', function () {
        graph.setSelectionCell(graph.groupCells(null, 0));
    }, null, null, 'Ctrl+G');
    this.addAction('ungroup', function () {
        graph.setSelectionCells(graph.ungroupCells());
    }, null, null, 'Ctrl+U');
    this.addAction('removeFromGroup', function () {
        graph.removeCellsFromParent();
    });
    this.addAction('merge',function() {
        graph.setSelectionCell(graph.mergeCells(null, 0));
        graph.refresh();
     });
    this.addAction('unmerge',function() {
        graph.setSelectionCells(graph.unmergeCell());
    });
    // Adds action //abandoned in v2.1
    /*this.addAction('createInstance', function () {
        ui.showDialog(new createInsDialogBody(ui,true,null, function (resHandle) {
            console.log(resHandle);
            var fileId = editor.getFileId();
            var fileType = editor.getFileType();
            var paramObj = {
                fileId : fileId
            };
            ui.communication.loadModelFile(paramObj,function(data){

                var paramObj = {
                    instanceName: resHandle.instanceName,
                    //instanceDes: resHandle.instanceDes,
                    fileIcon : resHandle.fileIcon,
                    detailDes: data.data.fileDesc,
                    isCooperation: true,
                    fileId:fileId,
                    fileType : fileType
                };
                //save the created instance's information
                ui.communication.persistInstanceFile(paramObj, function (fileData) {
                    var instanceId = fileData.id;
                    //pop the dialoge
                    var xml = mxUtils.getXml(this.editor.getGraphXml());
                    //ui.communication.getAllLane(instanceId, function (roleData) {
                    //    console.log(roleData);
                        var cell = graph.getModel().getRoot();
                        var idData = {
                            fileId: fileId,
                            instanceId: instanceId
                        };
                        //ui.showDialog(new assignRoleDialog(ui, roleData, cell, idData, true, function () {
                            var queryObj = appUtils.convertQueryStrToJSON();
                            queryObj.instanceId = instanceId;
                            queryObj.isInstance = true;
                            delete queryObj.gFileId;
                            window.open(appUtils.convertJSONToQueryStr(queryObj, true));
                        //}), 500, null, true, false);

                    //});
                })
            });
        }), 500, null, true, true);
    });*/

    this.addAction('manageInstance', function () {
        var processId = editor.getFileId();
        ui.showAllFiles(processId, null, null,'10100',mxUi);
    });

    this.addAction('setTopProcess', function () {
        ui.showDialog(new trueOrFalseDialogBody(ui, mxResources.get('setTheFileAsTopProcess'), function (resHandler) {
            //var fileId = editor.getFileId();
            var saveObj = {
                fileId : editor.getFileId(),
                fileType : editor.getFileType()
            };
            ui.communication.updateProcessIsTopProcess(saveObj, resHandler, function () {
                console.log('success');
            });
        }), 350, null, true, true);
    });
    this.addAction('setAttributes', function () {
        var queryObj = appUtils.convertQueryStrToJSON();
        if(queryObj.isInstance == 'true'){
            var paramObj = {
                instanceId : queryObj.instanceId
            };
            ui.communication.loadInstanceFile(paramObj,function(resData){
                ui.showDialog(new FilenameDialogBody(ui,mxResources.get(mxUi) + mxResources.get('description'),false,resData.data,function(resHandle){
                    if(resHandle){
                        var paramObj = {
                            instanceId: resData.data.id,
                            instanceName: resHandle.fileName,
                            briefDes: resHandle.briefDes,
                            detailDes:resHandle.fileDesc,
                            fileIcon : resHandle.fileIcon,
                            groupRange: resHandle.groupRange,
                            isCooperation: resHandle.isCooperation
                        };
                        ui.communication.updateInstanceFile(paramObj,function(result){
                            console.log(result);
                        });
                    }
                }), 700, null, true, false);
            });
        }else {
            var paramObj = {
                fileId : ui.editor.fileId,
                fileType: mxUi
            };
            ui.communication.loadModelFile(paramObj,function(resData){
                console.log(resData);
                ui.showDialog(new FilenameDialogBody(ui,mxResources.get(mxUi) + mxResources.get('description'),false,resData.data,function(resHandle){
                    if(resHandle){
                        var paramObj = {
                            fileId: resData.data.id,
                            fileName: resHandle.fileName,
                            briefDes: resHandle.briefDes,
                            detailDes: resHandle.fileDesc,
                            fileIcon : resHandle.fileIcon,
                            categoryId : resHandle.categoryId,
                            fileType: mxUi
                        };
                        ui.communication.updateModelFile(paramObj,function(result){
                            console.log(result);
                            ui.hideDialog();
                        });
                    }
                }),700,null,true,false);

            });
        }
    });

    this.addAction('shareBoard', function () {
        var boardId = editor.getFileId();
        ui.showDialog(new ManageBoardUsers(ui, boardId, function (addBoardUser, delBoardUser) {
            console.log('success');
        }), 500, null, true, true);
    });
    this.addAction('editData', function () {
        var cell = graph.getSelectionCell() || graph.getModel().getRoot();

        if (cell != null) {
            ui.showDialog(new MetadataDialogBody(ui, cell, mxResources.get('editData')), 555, 312, true, true);
        }
    }, null, null, 'Ctrl+M');
    this.addAction('comment', function () {
        var cell = graph.getSelectionCell();
        ui.showDialog(new TaskCommentsDialogBody(ui, cell), 555, null, true, true);
    });
    this.addAction('editObjectData...', function () {
        var cell = graph.getSelectionCell() || graph.getModel().getRoot();
        if (cell != null) {
            ui.showDialog(new editObjectDialogBody(ui, cell, function (objectData) {
                cell.setAttribute('label', objectData.name);
                cell.setAttribute('description', objectData.description);
                cell.setAttribute('uploadResource', JSON.stringify(objectData.uploadResource));
            }), 535, '', true, true);
        }
    });
    this.addAction('editProperty', function () {
        var cell = graph.getSelectionCell() || graph.getModel().getRoot();
        if (cell != null) {
            if (cell.getAttribute('type') === "bpmn.participant.pool") {
                ui.showDialog(new PropertyDialogBody(ui, cell, mxResources.get('editProperty'), []), 555, 600, true, true);
            } else if (cell.getAttribute('type') === "bpmn.gateway.general.end") {
                ui.showDialog(new ScoreSummaryDialogBody(ui), 755, 600, true, true);
            } else {
                if(cell.parent.getAttribute('member')) {
                    var memberJson = JSON.parse(cell.parent.getAttribute('member'));
                    if (memberJson.length > 0){
                        ui.showDialog(new PropertyDialogBody(ui, cell, mxResources.get('editProperty'), memberJson), 555, 600, true, true);
                    } else {
                        ui.showDialog(new PropertyDialogBody(ui, cell, mxResources.get('editProperty'), ['noMember']), 555, 600, true, true);
                    }
                }
                else {
                    //console.log(cell);
                    var name = /*(cell.getAttribute('label'))?('————' + cell.getAttribute('label')):*/'';
                    ui.showDialog(new PropertyDialogBody(ui, cell, mxResources.get('editStudyResource') +name, ['noMember'], {id: 'editStudyResource', member: ['noMember']}), 755, null, true, false);
                }
            }

        }
    });
    this.addAction('editChapterProperty...', function () {
        var cell = graph.getSelectionCell() || graph.getModel().getRoot();
        if (cell != null) {
            if (cell.getAttribute('type') === "bpmn.participant.pool") {
                ui.showDialog(new PropertyDialogBody(ui, cell, mxResources.get('editChapterProperty'), []), 555, 600, true, true);
            } else {
                if(cell.parent.getAttribute('member')) {
                    var memberJson = JSON.parse(cell.parent.getAttribute('member'));
                    if (memberJson.length > 0){
                        ui.showDialog(new PropertyDialogBody(ui, cell, mxResources.get('editChapterProperty'), memberJson), 555, 600, true, true);
                    } else {
                        ui.showDialog(new PropertyDialogBody(ui, cell, mxResources.get('editChapterProperty'), ['noMember']), 555, 600, true, true);
                    }
                }
                else {
                    //console.log(cell);
                    var name = (cell.getAttribute('label'))?('————' + cell.getAttribute('label')):'';
                    ui.showDialog(new PropertyDialogBody(ui, cell, mxResources.get('editChapterProperty') +name, ['noMember'], {id: 'editStudyResource', member: ['noMember']}), 755, null, true, true);
                }
            }

        }
    });

    // by fanmiaomiao  描述编辑属性
    this.addAction('describeInstance...', function (){
        var cell = graph.getSelectionCell() || graph.getModel().getRoot();
        if(cell != null){
                ui.showDialog(new DescribeEditDialogBody(ui, cell, mxResources.get('describeInstance')), 800, null, true, true);
            }
    },null,null,'');


    this.addAction('editTooltip...', function () {
        var graph = ui.editor.graph;

        if (graph.isEnabled() && !graph.isSelectionEmpty()) {
            var cell = graph.getSelectionCell();
            var tooltip = '';

            if (mxUtils.isNode(cell.value)) {
                var tmp = cell.value.getAttribute('tooltip');

                if (tmp != null) {
                    tooltip = tmp;
                }
            }

            var dlg = new TextareaDialog(ui, mxResources.get('enterValue') + ':', tooltip, function (newValue) {
                graph.setTooltipForCell(cell, newValue);
            });
            ui.showDialog(dlg, 320, 200, true, true);
            dlg.init();
        }
    });

    this.addAction('chooseCondition...', function () {
        var cell = graph.getSelectionCell() || graph.getModel().getRoot();

        if (cell != null) {
            ui.showDialog(new ConditionDialogBody(ui, cell, mxResources.get('chooseCondition')), 650, null, true, true);
        }
    }, null, null, '');

    this.addAction('openLink', function () {
        var link = graph.getLinkForCell(graph.getSelectionCell());

        if (link != null) {
            window.open(link);
        }
    });
    this.addAction('editLink...', function () {
        var graph = ui.editor.graph;

        if (graph.isEnabled() && !graph.isSelectionEmpty()) {
            var cell = graph.getSelectionCell();
            var value = graph.getLinkForCell(cell) || '';

            ui.showLinkDialog(value, mxResources.get('apply'), function (link) {
                link = mxUtils.trim(link);
                graph.setLinkForCell(cell, (link.length > 0) ? link : null);
            });
        }
    });
    this.addAction('link...', mxUtils.bind(this, function () {
        var graph = ui.editor.graph;

        if (graph.isEnabled()) {
            if (graph.cellEditor.isContentEditing()) {
                var link = graph.getParentByName(graph.getSelectedElement(), 'A', graph.cellEditor.text2);
                var oldValue = '';

                if (link != null) {
                    oldValue = link.getAttribute('href');
                }

                var selState = graph.cellEditor.saveSelection();

                ui.showLinkDialog(oldValue, mxResources.get('apply'), mxUtils.bind(this, function (value) {
                    graph.cellEditor.restoreSelection(selState);

                    // To find the new link, we create a list of all existing links first
                    // LATER: Refactor for reuse with code for finding inserted image below
                    var tmp = graph.cellEditor.text2.getElementsByTagName('a');
                    var oldLinks = [];

                    for (var i = 0; i < tmp.length; i++) {
                        oldLinks.push(tmp[i]);
                    }

                    if (value != null && value.length > 0) {
                        document.execCommand('createlink', false, mxUtils.trim(value));

                        // Adds target="_blank" for the new link
                        var newLinks = graph.cellEditor.text2.getElementsByTagName('a');

                        if (newLinks.length == oldLinks.length + 1) {
                            // Inverse order in favor of appended links
                            for (var i = newLinks.length - 1; i >= 0; i--) {
                                if (i == 0 || newLinks[i] != oldLinks[i - 1]) {
                                    newLinks[i].setAttribute('target', '_blank');
                                    break;
                                }
                            }
                        }
                    }
                }));
            }
            else if (graph.isSelectionEmpty()) {
                this.get('insertLink').funct();
            }
            else {
                this.get('editLink').funct();
            }
        }
    })).isEnabled = isGraphEnabled;
    this.addAction('autosize', function () {
        var cells = graph.getSelectionCells();

        if (cells != null) {
            graph.getModel().beginUpdate();
            try {
                for (var i = 0; i < cells.length; i++) {
                    var cell = cells[i];

                    if (graph.getModel().getChildCount(cell)) {
                        graph.updateGroupBounds([cell], 20);
                    }
                    else {
                        graph.updateCellSize(cell);
                    }
                }
            }
            finally {
                graph.getModel().endUpdate();
            }
        }
    }, null, null, 'Ctrl+Shift+Z');
    this.addAction('formattedText', function () {
        var state = graph.getView().getState(graph.getSelectionCell());
        var value = '1';

        graph.getModel().beginUpdate();
        try {
            if (state != null && state.style['html'] == '1') {
                value = null;

                // Removes newlines from HTML and converts breaks to newlines
                // to match the HTML output in plain text
                if (mxUtils.getValue(state.style, 'nl2Br', '1') != '0') {
                    graph.cellLabelChanged(state.cell, graph.convertValueToString(state.cell).
                        replace(/\n/g, '').replace(/<br\s*.?>/g, '\n'));
                }
            }
            else {
                // FIXME: HTML entities are converted in plain text labels if word wrap is on
                // TODO: Convert HTML entities? (Check for userobject!)
                // Converts newlines in plain text to breaks in HTML
                // to match the plain text output
                if (mxUtils.getValue(state.style, 'nl2Br', '1') != '0') {
                    graph.cellLabelChanged(state.cell, graph.convertValueToString(state.cell).
                        replace(/\n/g, '<br/>'));
                }
            }

            graph.setCellStyles('html', value);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', ['html'],
                'values', [(value != null) ? value : '0'], 'cells',
                graph.getSelectionCells()));
        }
        finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('wordWrap', function () {
        var state = graph.getView().getState(graph.getSelectionCell());
        var value = 'wrap';

        if (state != null && state.style[mxConstants.STYLE_WHITE_SPACE] == 'wrap') {
            value = null;
        }

        graph.setCellStyles(mxConstants.STYLE_WHITE_SPACE, value);
    });
    this.addAction('rotation', function () {
        var value = '0';
        var state = graph.getView().getState(graph.getSelectionCell());

        if (state != null) {
            value = state.style[mxConstants.STYLE_ROTATION] || value;
        }

        var dlg = new FilenameDialogBody2(ui, value, mxResources.get('apply'), function (newValue) {
            if (newValue != null && newValue.length > 0) {
                graph.setCellStyles(mxConstants.STYLE_ROTATION, newValue);
            }
        }, mxResources.get('enterValue') + ' (' + mxResources.get('rotation') + ' 0-360)');

        ui.showDialog(dlg, 300, 80, true, true);
        dlg.init();
    });
    // View actions
    this.addAction('actualSize', function () {
        graph.zoomTo(1);
        ui.resetScrollbars();
    }, null, null, 'Ctrl+0');
    this.addAction('zoomIn', function () {
        graph.zoomIn();
    }, null, null, 'Ctrl +');
    this.addAction('zoomOut', function () {
        graph.zoomOut();
    }, null, null, 'Ctrl -');
    this.addAction('fitWindow', function () {
        graph.fit();
    }, null, null, 'Ctrl+1');
    this.addAction('fitPage', mxUtils.bind(this, function () {
        if (!graph.pageVisible) {
            this.get('pageView').funct();
        }

        var fmt = graph.pageFormat;
        var ps = graph.pageScale;
        var cw = graph.container.clientWidth - 10;
        var ch = graph.container.clientHeight - 10;
        var scale = Math.floor(100 * Math.min(cw / fmt.width / ps, ch / fmt.height / ps)) / 100;
        graph.zoomTo(scale);

        if (mxUtils.hasScrollbars(graph.container)) {
            var pad = graph.getPagePadding();
            graph.container.scrollTop = pad.y;
            graph.container.scrollLeft = Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
        }
    }), null, null, 'Ctrl+3');
    this.addAction('fitTwoPages', mxUtils.bind(this, function () {
        if (!graph.pageVisible) {
            this.get('pageView').funct();
        }

        var fmt = graph.pageFormat;
        var ps = graph.pageScale;
        var cw = graph.container.clientWidth - 10;
        var ch = graph.container.clientHeight - 10;

        var scale = Math.floor(100 * Math.min(cw / (2 * fmt.width) / ps, ch / fmt.height / ps)) / 100;
        graph.zoomTo(scale);

        if (mxUtils.hasScrollbars(graph.container)) {
            var pad = graph.getPagePadding();
            graph.container.scrollTop = Math.min(pad.y, (graph.container.scrollHeight - graph.container.clientHeight) / 2);
            graph.container.scrollLeft = Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
        }
    }), null, null, 'Ctrl+4');
    this.addAction('fitPageWidth', mxUtils.bind(this, function () {
        if (!graph.pageVisible) {
            this.get('pageView').funct();
        }

        var fmt = graph.pageFormat;
        var ps = graph.pageScale;
        var cw = graph.container.clientWidth - 10;

        var scale = Math.floor(100 * cw / fmt.width / ps) / 100;
        graph.zoomTo(scale);

        if (mxUtils.hasScrollbars(graph.container)) {
            var pad = graph.getPagePadding();
            graph.container.scrollTop = pad.y;
            graph.container.scrollLeft = Math.min(pad.x, (graph.container.scrollWidth - graph.container.clientWidth) / 2);
        }
    }), null, null, 'Ctrl+2');
    this.put('customZoom', new Action(mxResources.get('custom') + '...', mxUtils.bind(this, function () {
        var dlg = new FilenameDialogBody2(this.editorUi, parseInt(graph.getView().getScale() * 100), mxResources.get('apply'), mxUtils.bind(this, function (newValue) {
            if (newValue != null && newValue.length > 0) {
                graph.zoomTo(parseInt(newValue) / 100);
            }
        }), mxResources.get('enterValue') + ' (%)');
        this.editorUi.showDialog(dlg, 300, 80, true, true);
        dlg.init();
    }), null, null, 'Ctrl+5'));

    // Option actions
    var action = null;
    action = this.addAction('grid', function () {
        graph.setGridEnabled(!graph.isGridEnabled());
        editor.updateGraphComponents();
        ui.fireEvent(new mxEventObject('gridEnabledChanged'));
    }, null, null, 'Ctrl+Shift+G');
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.isGridEnabled();
    });
    action.setEnabled(false);

    action = this.addAction('guides', function () {
        graph.graphHandler.guidesEnabled = !graph.graphHandler.guidesEnabled;
        ui.fireEvent(new mxEventObject('guidesEnabledChanged'));
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.graphHandler.guidesEnabled;
    });
    action.setEnabled(false);

    action = this.addAction('tooltips', function () {
        graph.tooltipHandler.setEnabled(!graph.tooltipHandler.isEnabled());
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.tooltipHandler.isEnabled();
    });

    action = this.addAction('navigation', function () {
        ui.setFoldingEnabled(!graph.foldingEnabled);
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.foldingEnabled;
    });
    action = this.addAction('scrollbars', function () {
        ui.setScrollbars(!ui.hasScrollbars());
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.scrollbars;
    });
    action = this.addAction('pageView', mxUtils.bind(this, function () {
        var hasScrollbars = mxUtils.hasScrollbars(graph.container);
        var tx = 0;
        var ty = 0;

        if (hasScrollbars) {
            tx = graph.view.translate.x * graph.view.scale - graph.container.scrollLeft;
            ty = graph.view.translate.y * graph.view.scale - graph.container.scrollTop;
        }

        graph.pageVisible = !graph.pageVisible;
        graph.pageBreaksVisible = graph.pageVisible;
        graph.preferPageSize = graph.pageBreaksVisible;
        editor.updateGraphComponents();

        // Removes background page
        graph.refresh();

        // Workaround for possible handle offset
        if (hasScrollbars) {
            var cells = graph.getSelectionCells();
            graph.clearSelection();
            graph.setSelectionCells(cells);
        }

        // Calls updatePageBreaks
        graph.sizeDidChange();

        if (hasScrollbars) {
            graph.container.scrollLeft = graph.view.translate.x * graph.view.scale - tx;
            graph.container.scrollTop = graph.view.translate.y * graph.view.scale - ty;
        }

        ui.fireEvent(new mxEventObject('pageViewChanged'));
    }));
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.pageVisible;
    });
    this.put('pageBackgroundColor', new Action(mxResources.get('backgroundColor') + '...', function () {
        ui.pickColor(graph.background || 'none', function (color) {
            ui.setBackgroundColor(color);
        });
    }));
    action = this.addAction('connectionPoints', function () {
        graph.setConnectable(!graph.connectionHandler.isEnabled());
    }, null, null, 'Ctrl+Q');
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.connectionHandler.isEnabled();
    });
    action = this.addAction('copyConnect', function () {
        graph.connectionHandler.setCreateTarget(!graph.connectionHandler.isCreateTarget());
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.connectionHandler.isCreateTarget();
    });
    action = this.addAction('autosave', function () {
        ui.editor.autosave = !ui.editor.autosave;
        ui.startEndAutoSave();
    });
    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return ui.editor.autosave;
    });
    action.isEnabled = isGraphEnabled;
    action.visible = true;

    // Help actions
    this.addAction('help', function () {
        var ext = '';

        if (mxResources.isLanguageSupported(mxClient.language)) {
            ext = '_' + mxClient.language;
        }

        window.open(RESOURCES_PATH + '/help' + ext + '.html');
    });
    this.put('about', new Action(mxResources.get('about'), function () {
        ui.showDialog(new AboutDialog(ui), 320, null, true, true);
    }, null, null, 'F1'));

    // Font style actions
    var toggleFontStyle = mxUtils.bind(this, function (key, style, fn) {
        this.addAction(key, function () {
            if (fn != null && graph.cellEditor.isContentEditing()) {
                fn();
            }
            else {
                graph.stopEditing(false);
                graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, style);
            }
        });
    });

    toggleFontStyle('bold', mxConstants.FONT_BOLD, function () {
        document.execCommand('bold', false, null);
    });
    toggleFontStyle('italic', mxConstants.FONT_ITALIC, function () {
        document.execCommand('italic', false, null);
    });
    toggleFontStyle('underline', mxConstants.FONT_UNDERLINE, function () {
        document.execCommand('underline', false, null);
    });

    // Color actions
    this.addAction('fontColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_FONTCOLOR, 'forecolor', '000000');
    });
    this.addAction('strokeColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_STROKECOLOR);
    });
    this.addAction('fillColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_FILLCOLOR);
    });
    this.addAction('gradientColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_GRADIENTCOLOR);
    });
    this.addAction('backgroundColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_LABEL_BACKGROUNDCOLOR, 'backcolor');
    });
    this.addAction('borderColor...', function () {
        ui.menus.pickColor(mxConstants.STYLE_LABEL_BORDERCOLOR);
    });

    // Format actions
    this.addAction('vertical', function () {
        ui.menus.toggleStyle(mxConstants.STYLE_HORIZONTAL, true);
    });
    this.addAction('shadow', function () {
        ui.menus.toggleStyle(mxConstants.STYLE_SHADOW);
    });
    this.addAction('solid', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_DASHED, null);
            graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
                'values', [null, null], 'cells', graph.getSelectionCells()));
        }
        finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('dashed', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_DASHED, '1');
            graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, null);
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
                'values', ['1', null], 'cells', graph.getSelectionCells()));
        }
        finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('dotted', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_DASHED, '1');
            graph.setCellStyles(mxConstants.STYLE_DASH_PATTERN, '1 4');
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_DASHED, mxConstants.STYLE_DASH_PATTERN],
                'values', ['1', '1 4'], 'cells', graph.getSelectionCells()));
        }
        finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('sharp', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_ROUNDED, '0');
            graph.setCellStyles(mxConstants.STYLE_CURVED, '0');
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
                'values', ['0', '0'], 'cells', graph.getSelectionCells()));
        }
        finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('rounded', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_ROUNDED, '1');
            graph.setCellStyles(mxConstants.STYLE_CURVED, '0');
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
                'values', ['1', '0'], 'cells', graph.getSelectionCells()));
        }
        finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('curved', function () {
        graph.getModel().beginUpdate();
        try {
            graph.setCellStyles(mxConstants.STYLE_ROUNDED, '0');
            graph.setCellStyles(mxConstants.STYLE_CURVED, '1');
            ui.fireEvent(new mxEventObject('styleChanged', 'keys', [mxConstants.STYLE_ROUNDED, mxConstants.STYLE_CURVED],
                'values', ['0', '1'], 'cells', graph.getSelectionCells()));
        }
        finally {
            graph.getModel().endUpdate();
        }
    });
    this.addAction('collapsible', function () {
        ui.menus.toggleStyle('container');
    });
    this.addAction('editStyle...', mxUtils.bind(this, function () {
        var cells = graph.getSelectionCells();

        if (cells != null && cells.length > 0) {
            var model = graph.getModel();

            var dlg = new TextareaDialog(this.editorUi, mxResources.get('editStyle') + ':',
                model.getStyle(cells[0]) || '', function (newValue) {
                    if (newValue != null) {
                        graph.setCellStyle(mxUtils.trim(newValue), cells);
                    }
                }, null, null, 400, 220);
            this.editorUi.showDialog(dlg, 420, 300, true, true);
            dlg.init();
        }
    }), null, null, 'Ctrl+E');
    this.addAction('setAsDefaultStyle', function () {
        if (graph.isEnabled() && !graph.isSelectionEmpty()) {
            ui.setDefaultStyle(graph.getSelectionCell());
        }
    }, null, null, 'Ctrl+Shift+D');
    this.addAction('clearDefaultStyle', function () {
        if (graph.isEnabled()) {
            ui.clearDefaultStyle();
        }
    }, null, null, 'Ctrl+Shift+R');
    if(isStartProcessEngine){
        this.addAction('startDebug', function () {
            graph.savable = false;
            graph.startProcessSimu();
        }, null, null, null);
        this.addAction('runProcess', mxUtils.bind(this, function () {
            var msgHandler = mxUtils.bind(this, function (message) {
                this.editorUi.showDialog(new messageDialogBody(this.editorUi, message.msg),300,null,true,true);
            });
            graph.goToNextStep(msgHandler);
        }), null, null, 'Ctrl+F5');
        this.addAction('stopDebug', function () {
            graph.resetRunningTask(true);
            graph.savable = true;
            graph.endAllStep(editor.getFileId());
        }, null, null, null);
    }

    this.addAction('editSubProcess', function () {
        ui.editSubProcess(graph.getSelectionCell());
    }, null, null, null);
    this.addAction('separateSubProcess', function () {
        // by fangzhou
        ui.separateSubProcess(graph.getSelectionCell());
    }, null, null, null);
    this.addAction('addWaypoint', function () {
        var cell = graph.getSelectionCell();

        if (cell != null && graph.getModel().isEdge(cell)) {
            var handler = editor.graph.selectionCellsHandler.getHandler(cell);

            if (handler instanceof mxEdgeHandler) {
                var t = graph.view.translate;
                var s = graph.view.scale;
                var dx = t.x;
                var dy = t.y;

                var parent = graph.getModel().getParent(cell);
                var pgeo = graph.getCellGeometry(parent);

                while (graph.getModel().isVertex(parent) && pgeo != null) {
                    dx += pgeo.x;
                    dy += pgeo.y;

                    parent = graph.getModel().getParent(parent);
                    pgeo = graph.getCellGeometry(parent);
                }

                var x = Math.round(graph.snap(graph.popupMenuHandler.triggerX / s - dx));
                var y = Math.round(graph.snap(graph.popupMenuHandler.triggerY / s - dy));

                handler.addPointAt(handler.state, x, y);
            }
        }
    });
    this.addAction('removeWaypoint', function () {
        // TODO: Action should run with "this" set to action
        var rmWaypointAction = ui.actions.get('removeWaypoint');

        if (rmWaypointAction.handler != null) {
            // NOTE: Popupevent handled and action updated in Menus.createPopupMenu
            rmWaypointAction.handler.removePoint(rmWaypointAction.handler.state, rmWaypointAction.index);
        }
    });
    this.addAction('clearWaypoints', function () {
        var cells = graph.getSelectionCells();

        if (cells != null) {
            graph.getModel().beginUpdate();
            try {
                for (var i = 0; i < cells.length; i++) {
                    var cell = cells[i];

                    if (graph.getModel().isEdge(cell)) {
                        var geo = graph.getCellGeometry(cell);

                        if (geo != null) {
                            geo = geo.clone();
                            geo.points = null;
                            graph.getModel().setGeometry(cell, geo);
                        }
                    }
                }
            }
            finally {
                graph.getModel().endUpdate();
            }
        }
    });
    this.addAction('insertLink', function () {
        if (graph.isEnabled()) {
            var dlg = new LinkDialog(ui, '', mxResources.get('insert'), function (link, docs) {
                link = mxUtils.trim(link);

                if (link.length > 0) {
                    var title = link.substring(link.lastIndexOf('/') + 1);
                    var icon = null;

                    if (docs != null && docs.length > 0) {
                        icon = docs[0].iconUrl;
                        title = docs[0].name || docs[0].type;
                        title = title.charAt(0).toUpperCase() + title.substring(1);

                        if (title.length > 30) {
                            title = title.substring(0, 30) + '...';
                        }
                    }

                    var gs = graph.getGridSize();
                    var dx = graph.container.scrollLeft / graph.view.scale - graph.view.translate.x;
                    var dy = graph.container.scrollTop / graph.view.scale - graph.view.translate.y;

                    var linkCell = new mxCell(title, new mxGeometry(graph.snap(dx + gs), graph.snap(dy + gs), 100, 40),
                        'fontColor=#0000EE;fontStyle=4;rounded=1;overflow=hidden;' + ((icon != null) ?
                        'shape=label;imageWidth=16;imageHeight=16;spacingLeft=26;align=left;image=' + icon :
                            'spacing=10;'));
                    linkCell.vertex = true;

                    graph.setLinkForCell(linkCell, link);
                    graph.cellSizeUpdated(linkCell, true);
                    graph.setSelectionCell(graph.addCell(linkCell));
                }
            });

            ui.showDialog(dlg, 320, 90, true, true);
            dlg.init();
        }
    }).isEnabled = isGraphEnabled;
    this.addAction('image...', function () {
        if (graph.isEnabled()) {
            var title = mxResources.get('image') + ' (' + mxResources.get('url') + '):';
            var state = graph.getView().getState(graph.getSelectionCell());
            var value = '';

            if (state != null) {
                value = state.style[mxConstants.STYLE_IMAGE] || value;
            }

            var selectionState = graph.cellEditor.saveSelection();

            ui.showImageDialog(title, value, function (newValue, w, h) {
                // Inserts image into HTML text
                if (graph.cellEditor.isContentEditing()) {
                    graph.cellEditor.restoreSelection(selectionState);
                    graph.insertImage(newValue, w, h);
                }
                else {
                    var cells = graph.getSelectionCells();

                    if (cells.length > 0 || newValue != null) {
                        var select = null;

                        graph.getModel().beginUpdate();
                        try {
                            // Inserts new cell if no cell is selected
                            if (cells.length == 0) {
                                var gs = graph.getGridSize();
                                var dx = graph.container.scrollLeft / graph.view.scale - graph.view.translate.x;
                                var dy = graph.container.scrollTop / graph.view.scale - graph.view.translate.y;

                                cells = [graph.insertVertex(graph.getDefaultParent(), null, '',
                                    graph.snap(dx + gs), graph.snap(dy + gs), w, h,
                                    'shape=image;verticalLabelPosition=bottom;verticalAlign=top;')];
                                select = cells;
                            }

                            graph.setCellStyles(mxConstants.STYLE_IMAGE, newValue, cells);

                            // Sets shape only if not already shape with image (label or image)
                            var state = graph.view.getState(cells[0]);
                            var style = (state != null) ? state.style : graph.getCellStyle(cells[0]);

                            if (style[mxConstants.STYLE_SHAPE] != 'image' && style[mxConstants.STYLE_SHAPE] != 'label') {
                                graph.setCellStyles(mxConstants.STYLE_SHAPE, 'image', cells);
                            }

                            if (graph.getSelectionCount() == 1) {
                                if (w != null && h != null) {
                                    var cell = cells[0];
                                    var geo = graph.getModel().getGeometry(cell);

                                    if (geo != null) {
                                        geo = geo.clone();
                                        geo.width = w;
                                        geo.height = h;
                                        graph.getModel().setGeometry(cell, geo);
                                    }
                                }
                            }
                        }
                        finally {
                            graph.getModel().endUpdate();
                        }

                        if (select != null) {
                            graph.setSelectionCells(select);
                            graph.scrollCellToVisible(select[0]);
                        }
                    }
                }
            }, graph.cellEditor.isContentEditing());
        }
    }).isEnabled = isGraphEnabled;
    action = this.addAction('layers', mxUtils.bind(this, function () {
        if (this.layersWindow == null) {
            // LATER: Check outline window for initial placement
            this.layersWindow = new LayersWindow(ui, document.body.offsetWidth - 280, 120, 220, 180);
            this.layersWindow.window.setVisible(true);
        }
        else {
            this.layersWindow.window.setVisible(!this.layersWindow.window.isVisible());
        }
    }), null, null, 'Ctrl+Shift+L');
    action.setToggleAction(true);
    action.setSelectedCallback(mxUtils.bind(this, function () {
        return this.layersWindow != null && this.layersWindow.window.isVisible();
    }));
    action = this.addAction('formatPanel', mxUtils.bind(this, function () {
        ui.formatWidth = (ui.formatWidth > 0) ? 0 : 240;
        ui.propertyContainer.style.display = (ui.formatWidth > 0) ? '' : 'none';
        ui.refresh();
        ui.format.refresh();
        ui.fireEvent(new mxEventObject('formatWidthChanged'));
    }), null, null, 'Ctrl+Shift+P');
    action.setToggleAction(true);
    action.setSelectedCallback(mxUtils.bind(this, function () {
        return ui.formatWidth > 0;
    }));
    action = this.addAction('outline', mxUtils.bind(this, function () {
        if (this.outlineWindow == null) {
            // LATER: Check layers window for initial placement
            this.outlineWindow = new OutlineWindow(ui, document.body.offsetWidth - 260, 100, 180, 180);
            this.outlineWindow.window.setVisible(true);
        }
        else {
            this.outlineWindow.window.setVisible(!this.outlineWindow.window.isVisible());
        }
    }), null, null, 'Ctrl+Shift+O');

    action.setToggleAction(true);
    action.setSelectedCallback(function () {
        return graph.scrollbars;
    });

    action.setToggleAction(true);
    action.setSelectedCallback(mxUtils.bind(this, function () {
        return this.outlineWindow != null && this.outlineWindow.window.isVisible();
    }));


    // file operation actions
    this.addAction('deleteTrashFile', mxUtils.bind(this, function () {
        var fileEntityBox = this.editorUi.currentSeletedFiles[0];
        var fileEntityBoxList = this.editorUi.selectFilesList;
        if (fileEntityBoxList.length > 1) {
            //Eamonn todo
            ui.removeAllModelFile(mxResources.get('okToDelete'), fileEntityBoxList, function () {
                for (var j = 0; j < fileEntityBoxList.length; j++) {
                    fileEntityBoxList[j].removeMe();
                }
            });
        } else if (fileEntityBox) {
            var fileEntity = fileEntityBox.getFileEntity();
            var fileObj = {
                isInstance : fileEntity.isInstance,
                gFileId : fileEntity.gFileId
            };
            //ui.trashModelFile(mxResources.get('ok')+'将 '+fileEntity.fileName+" 放入回收站?",fileEntity, function(){
            ui.removeModelFile(mxResources.get('okToDelete') + '\r\n' + fileEntity.fileName, fileObj, function () {
                //fileEntityBox.removeMe(editor,fileEntity.gFileId);
                fileEntityBox.removeMe();
            });
        }
    }, null, null, null));

    this.addAction('deleteFile', mxUtils.bind(this, function () {
        var fileEntityBox = this.editorUi.currentSeletedFiles[0];
        var fileEntityBoxList = this.editorUi.selectFilesList;
        if (fileEntityBoxList.length > 1) {

            ui.trashAllModelFile(mxResources.get('deleteTheseFile'), fileEntityBoxList, function () {
                for (var j = 0; j < fileEntityBoxList.length; j++) {
                    fileEntityBoxList[j].removeMe();
                }
            });
        } else if (fileEntityBox) {
            var fileEntity = fileEntityBox.getFileEntity();
            var fileObj = {
                isInstance : fileEntity.isInstance,
                gFileId : fileEntity.gFileId
            };
            //ui.trashModelFile(mxResources.get('ok')+'将 '+fileEntity.fileName+" 放入回收站?",fileEntity, function(){
            ui.trashModelFile(mxResources.get('deleteThisFile') + '\r\n' + fileEntity.fileName, fileObj, function () {
                //fileEntityBox.removeMe(editor,fileEntity.gFileId);
                fileEntityBox.removeMe();
            });
        }
    }, null, null, null));


    this.addAction('cancelDelete', mxUtils.bind(this, function () {
        var fileEntityBox = this.editorUi.currentSeletedFiles[0];
        var fileEntityBoxList = this.editorUi.selectFilesList;
        if (fileEntityBoxList.length > 1) {
            ui.restoreAllModelFile(fileEntityBoxList, function () {
                for (var j = 0; j < fileEntityBoxList.length; j++) {
                    fileEntityBoxList[j].removeMe();
                }
            });
        } else {
            if (fileEntityBox) {
                var fileEntity = fileEntityBox.getFileEntity();
                ui.trashToNormal(fileEntity, function () {
                    fileEntityBox.removeMe()
                });
            }
        }
    }, null, null, null));

    this.addAction('renameFile', mxUtils.bind(this, function () {
        var fileEntityBox = this.editorUi.currentSeletedFiles[0];
        if(fileEntityBox){
                var fileEntity = fileEntityBox.getFileEntity();
                ui.renameModelFile(fileEntity, function(fileEntity){
                    fileEntityBox.setFileName(fileEntity.fileName);
                });
            }
    }, null, null, null));

    this.addAction('assignRole', mxUtils.bind(this, function () {

        var fileEntityBox = this.editorUi.currentSeletedFiles[0];

        if(fileEntityBox) {
            var fileEntity = fileEntityBox.getFileEntity();
            var instenceId = fileEntity.gFileId;
            var fileId = editor.getFileId();
            ui.communication.getAllLane(instenceId, function (roleData) {
                var cell = graph.getModel().getRoot();
                var idData = {
                    fileId: fileId,
                    instanceId: instenceId
                };
                ui.showDialog(new assignRoleDialog(ui, roleData, cell, idData, false, function () {
                    console.log('su');

                }), 500, null, true, true);
            });
        }
    }, null, null, null));
    this.addAction('unpublishTheCourse', mxUtils.bind(this, function () {
        var fileEntityBox = this.editorUi.currentSeletedFiles[0];
        if(fileEntityBox) {
            var fileEntity = fileEntityBox.getFileEntity();
            var instanceId = fileEntity.gFileId;
            var isInstance = fileEntity.isInstance;
            ui.showDialog(new confirmDialogBody_Blue(ui, mxResources.get('unpublishTheCourse'), mxResources.get('unpublishTheCourseFromPlayer'), function () {
                ui.communication.changePublicState(instanceId, isInstance, function (messsage) {
                    fileEntityBox.removefileSign();
                    fileEntityBox.isPublished = false;
                });
            }), 300, null, true, true);
        }
    }, null, null, null));
    this.addAction('publishTheCourse', mxUtils.bind(this, function () {
        var fileEntityBox = this.editorUi.currentSeletedFiles[0];
        if(fileEntityBox) {
            var fileEntity = fileEntityBox.getFileEntity();
            var fileId = fileEntity.gFileId;
            var isInstance = fileEntity.isInstance;
            ui.showDialog(new publishDialogBody(ui, mxResources.get('publishTheCourse'), mxResources.get('publishTheCourseToPlayer'), function (permission) {
                ui.communication.changePublicState(fileId, isInstance?isInstance:permission, function (messsage) {
                    fileEntityBox.fileInfoDiv.insertBefore(fileEntityBox.createfileSign(mxResources.get('published')),fileEntityBox.fileSpan.nextSibling);
                    fileEntityBox.isPublished = true;
                });
            }), 400, null, true, true);
        }
    }, null, null, null));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.addAction = function (key, funct, enabled, iconCls, shortcut) {
    var title;

    if (key.substring(key.length - 3) == '...') {
        key = key.substring(0, key.length - 3);
        title = mxResources.get(key) + '...';
    }
    else {
        title = mxResources.get(key);
    }

    return this.put(key, new Action(title, funct, enabled, iconCls, shortcut));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.put = function (name, action) {
    this.actions[name] = action;

    return action;
};

/**
 * Returns the action for the given name or null if no such action exists.
 */
Actions.prototype.get = function (name) {
    return this.actions[name];
};

/**
 * Constructs a new action for the given parameters.
 */
function Action(label, funct, enabled, iconCls, shortcut) {
    mxEventSource.call(this);
    this.label = label;
    this.funct = funct;
    this.enabled = (enabled != null) ? enabled : true;
    this.iconCls = iconCls;
    this.shortcut = shortcut;
    this.visible = true;
};

// Action inherits from mxEventSource
mxUtils.extend(Action, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setEnabled = function (value) {
    if (this.enabled != value) {
        this.enabled = value;
        this.fireEvent(new mxEventObject('stateChanged'));
    }
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isEnabled = function () {
    return this.enabled;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setToggleAction = function (value) {
    this.toggleAction = value;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setSelectedCallback = function (funct) {
    this.selectedCallback = funct;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isSelected = function () {
    return this.selectedCallback();
};
