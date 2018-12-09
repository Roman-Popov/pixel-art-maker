$(document).ready(function () {

    // >>>>>> Objects and variables declaration section >>>>>>

    const body = $('body');

    // -->>-- Buttons subsection -->>--
    const HintBtn = $('.hints');
    const NotifBtn = $('.alert-btn');
    const UndoBtn = $('.undo');
    const RedoBtn = $('.redo');
    const UndoRedoBtns = $('.changes');
    const EyedrBtn = $('.eyedropper');
    const ClearBtn = $('#clear');
    const BgrBtn = $('#bg-btn');
    const SubmitBtn = $('#submit');

    let pushedButton;
    // --<<-- End of buttons subsection --<<--

    // -->>-- Pop-up windows subsection -->>--
    const PopUpBgr = $('.pop-up');          // Background of pop-up windows
    const AlertWindow = $('.alert');        // All pop-up windows
    const DelWindow = $('.del-question');
    const ErrDelWindow = $('.error-del');
    const ErrEyedropWindow = $('.error-eyedrop');
    const ReadMeWindow = $('#instructions');
    const InstrBody = $('.instr-body');
    const BackToTop = $('.back-to-top');
    // --<<-- End of pop-up windows subsection --<<--

    // -->>-- Canvas subsection -->>--
    const CanvasBgr = $('.canvas-background');
    const CurrColor = $('#take-this-color');
    const BgrColor = $('#bg-color');

    let Canvas = $('#pixel-canvas');
    let CanvasTr;
    let CanvasTd;
    let isSmthOnCanvas = false;
    let hasBackground = false;
    let tracking = false;
    // --<<-- End of canvas subsection --<<--

    // -->>-- Canvas settings subsection -->>--
    const Input = $('input');
    const SizeForm = $('.size-picker');
    const InputNumber = $('.input-number');
    const InputHeight = $('#input-height');
    const InputWidth = $('#input-width');
    const InputSize = $('#input-size');
    const CanvasGrid = $('#input-grid');
    const ColorForm = $('.color-picker');
    // --<<-- End of canvas settings subsection --<<--

    // -->>-- Undo-Redo subsection -->>--
    let history = [[], [], [], []]; // 0: CanvasBgr;    1:CurrColor;    2:CanvasGrid;    3:BgColor.
    let currPosition;
    let UndoLimit;
    let undoCount = 0;
    // --<<-- End of undo-Redo subsection --<<--

    // <<<<<< End of objects and variables declaration section <<<<<<



    // >>>>>> Function declaration section >>>>>>

    // Hide excess greeting elements
    function hideHeader() {
        if (body.hasClass('checked') === false) {
            $('.welcome>h2, .welcome>.separator').fadeToggle(300);
            $('.welcome').slideToggle(300);
            $('#main-header').addClass('go-paint');
            HintBtn.removeClass('hints-pulse');
        };
    }


    // Show pop-up window
    function showPopUp(option) {
        PopUpBgr.addClass('visible');
        switch (option) {
            case 'delete':
                ErrDelWindow.addClass('visible');
                break;
            case 'eyedropper':
                ErrEyedropWindow.addClass('visible');
                break;
            case 'readme':
                ReadMeWindow.addClass('visible');
                break;
            default:
                break;
        };
        NotifBtn.click(function () {
            NotifBtn.off('click');
            PopUpBgr.removeClass('visible');
            AlertWindow.removeClass('visible');
        });
    }


    // History managing for undo-redo functions
    function manageHistory(option) {
        // options
        switch (option) {
            case 'update':
                currPosition = history[0].length - undoCount;
                history.forEach(element => {
                    element.splice(currPosition, history[0].length - 1);
                });

                undoCount = 0;
                break;
            case 'clear':
                history = [[], [], [], []];
                undoCount = 0;
                return;
            default:
                break;
        };

        // If history's subarray length more than maximum
        if (history[0].length >= UndoLimit + 1) {
            // Delete first element of each "history" subarray
            history.forEach(element => {
                element.shift();
            });
        };
        // Add elements to the end of each "history" subarray
        history[0].push(CanvasBgr.html());              // canvas
        history[1].push(CurrColor.attr('bgcolor'));     // color-picker
        history[2].push(CanvasGrid.prop('checked'));    // grid
        if (BgrColor.attr('bgcolor') === undefined) {   // background
            history[3].push('')
        }
        else {
            history[3].push(BgrColor.attr('bgcolor'));
        };
    }


    // Manage of undo-redo buttons conditions (enabled/disabled)
    function manageUndoRedoBtn() {
        if (CanvasBgr.css('display') === 'block') {
            if (undoCount === 0) {
                UndoBtn.removeAttr('disabled');  // Undo enabled
                RedoBtn.attr('disabled', '');    // Redo disabled
            }
            else if (undoCount < UndoLimit && undoCount < (history[0].length - 1)) {
                UndoBtn.removeAttr('disabled');  // Undo enabled
                RedoBtn.removeAttr('disabled');  // Redo enabled
            }
            else {
                UndoBtn.attr('disabled', '');    // Undo disabled
                RedoBtn.removeAttr('disabled');  // Redo enabled
            }
        }
        else {
            // It's clear canvas
            UndoBtn.attr('disabled', '');        // Undo disabled
            RedoBtn.attr('disabled', '');        // Redo disabled
        }
    }


    // Let's draw a masterpiece :)
    function drawing() {
        let isDrawing = false;
        let color;
        if (Canvas.hasClass('active-eyedr')) {
            EyedrBtn.removeClass('active-eyedr');
            Canvas.removeClass('active-eyedr');
            CanvasTd.off();
        };
        // Canceling selecting text on 'mousedown' event
        // for better view while the pointer accidentally
        // became outside the canvas
        body.on('mousedown', function (event) {
            if (isDrawing) event.preventDefault();
        });
        // Start drawing
        CanvasTd.on('mousedown', function (event) {
            Canvas.addClass('drawing');
            isDrawing = true;
            isSmthOnCanvas = true;
            ClearBtn.html('Clear Canvas');
            if (event.shiftKey) {
                color = '';
                $('.erase-img').addClass('visible');
                Canvas.removeClass('drawing');
                Canvas.addClass('erase-cursor');
            }
            else {
                color = CurrColor.attr('bgcolor');
            };
            $(this).attr('bgcolor', color);
            CanvasTd.on('mouseenter', function () {
                $(this).attr('bgcolor', color);
            });
            // Stop drawing
            body.on('mouseup', function () {
                $('.erase-img').removeClass('visible');
                Canvas.removeClass('erase-cursor');
                Canvas.removeClass('drawing');
                isDrawing = false;
                CanvasTd.off('mouseenter');
                body.off('mouseup');
                manageHistory('update');
                manageUndoRedoBtn();
            });
        });
    }


    // Reaction to undo-redo buttons and Ctrl+Z(Y) hotkeys
    function undoRedo(options) {
        let key = options.key;
        let btn;
        switch (typeof (options.btn)) {
            case 'object': btn = options.btn; break;
            default: btn = $();
        };
        let length = history[0].length;
        let target;
        if (btn.hasClass('undo') || key == 'KeyZ') {
            if (undoCount >= (history[0].length - 1)) {
                return;
            }
            undoCount += 1;
            target = length - undoCount - 1;
        }
        else if (btn.hasClass('redo') || key == 'KeyY') {
            if (undoCount <= 0) {
                return;
            }
            target = length - undoCount
            undoCount -= 1;
        }
        else {
            return;
        }
        CanvasBgr.html(history[0][target]);
        CurrColor.attr('bgcolor', history[1][target]);
        CanvasGrid.prop('checked', history[2][target]);
        BgrColor.attr('bgcolor', history[3][target]);
        if (BgrColor.attr('bgcolor') == '') {
            BgrBtn.html('Add background');
            hasBackground = false;
        } else {
            BgrBtn.html('Remove background');
            hasBackground = true;
        }
        // Updating collections
        Canvas = $('#pixel-canvas');
        CanvasTd = $('.td');
        manageUndoRedoBtn();
        drawing();
    }


    // Add/remove background of canvas
    function manageBackground() {
        let color = CurrColor.attr('bgcolor');
        // The canvas already has a background
        // Need to delete a background
        if (hasBackground) {
            Canvas.attr('bgcolor', '');
            BgrColor.attr('bgcolor', '');
            BgrBtn.html('Add background');
            hasBackground = false;
        }
        // The doesn't have a background
        // Need to add a background
        else {
            Canvas.attr('bgcolor', color);
            BgrColor.attr('bgcolor', color);
            BgrBtn.html('Remove background');
            hasBackground = true;
        };
        if (CanvasBgr.css('display') === 'block') {
            manageHistory('update');
            manageUndoRedoBtn();
        };
    }


    // Add/remove grid lines function. Checking "borders" checkbox
    function manageGrid() {
        CanvasGrid.prop('checked') ?
            Canvas.addClass('borders') :
            Canvas.removeClass('borders');
        if (CanvasBgr.css('display') === 'block') {
            manageHistory('update');
            manageUndoRedoBtn();
        };
    }


    // Activate eyedropper
    function manageEyedropper() {
        EyedrBtn.addClass('active-eyedr');
        Canvas.addClass('active-eyedr');
        CanvasTd.off();
        CanvasTd.mousedown(function () {
            CanvasTd.off();
            let color = $(this).attr('bgcolor');
            if (color != undefined && color != '') {
                CurrColor.attr('bgcolor', color);
            }
            else {
                showPopUp('eyedropper');
            };
            drawing();
        });
    }


    // Change color with the keyboard
    function colorTracking(event) {
        if ([49, 50, 51, 52].indexOf(event.which) != -1) {
            CurrColor.attr('bgcolor', $('#color-picker-' + event.which).val());
        };
    }


    // Start keyboard tracking
    function keyboardTracking() {
        body.keypress(colorTracking)
        // In case of first start
        if (tracking === false) {
            tracking = true;
            // Start tracking
            body.keydown(function (event) {
                // Used event.originalEvent.code instead of event.which
                // because painter can use not only english keyboard layout
                // For an example: Z == 122 but e.g. russian "Я" has the same key
                // and another code Я == 1103
                let key = event.originalEvent.code;
                if (event.ctrlKey === false) {
                    switch (key) {
                        case 'KeyB':
                            manageBackground();
                            break;
                        case 'KeyG':
                            if (CanvasGrid.prop('checked')) { CanvasGrid.prop('checked', false); }
                            else { CanvasGrid.prop('checked', true); }
                            manageGrid();
                            break;
                        case 'KeyH':
                            event.preventDefault();
                            InputHeight.select();
                            break;
                        case 'KeyW':
                            event.preventDefault();
                            InputWidth.select();
                            break;
                        case 'KeyS':
                            event.preventDefault();
                            InputSize.select();
                            break;
                        case 'KeyI':
                            manageEyedropper();
                            break;
                        case 'Delete':
                            if (InputNumber.is(":focus") == false) {
                                clearStatus();
                            };
                            break;
                        case 'Escape':
                            InputNumber.blur();
                            PopUpBgr.removeClass('visible');
                            AlertWindow.removeClass('visible');
                            EyedrBtn.off('mousedown', manageEyedropper);
                            drawing();
                        default:
                            break;
                    };
                }
                else if ((key === 'KeyY' || key === 'KeyZ')) {
                    undoRedo({ key: key });
                };
            });
        };
    }


    // Stop color tracking by keypress
    function colorTrackingOff() {
        body.off('keypress', colorTracking);
    }


    // Required to prevent change colors during
    // typing numbers into "size" forms
    function isFormFocused() {
        InputNumber.focusin(function () {
            $(this).addClass('activeForm');
            colorTrackingOff();
        });
        Input.blur(function () {
            keyboardTracking();
            $(this).removeClass('activeForm');
        });
        Canvas.mouseover(function () {
            Canvas.off('mouseover');
            Input.blur();
        });
    }


    // Making cells function
    // * also runs "drawing()" function
    function makeCells() {
        const rows = InputHeight.val();
        const cols = InputWidth.val();
        const pixelSize = InputSize.val() + 'px';
        const TotalCells = rows * cols;
        // Setting memory limit for undo-redo operations
        UndoLimit = (TotalCells < 400) ? 5 : (TotalCells < 1600) ? 3 : 2;
        // "Start drawing" button goes to the normal mode
        SubmitBtn.removeClass('pulse');
        // Creating table rows
        for (let i = 0; i < rows; i++) {
            Canvas.append('<tr class="tr"></tr>');
        }
        CanvasTr = $('.tr');
        // Creating cells to every row
        for (let j = 0; j < cols; j++) {
            CanvasTr.append('<td class="td"></<td>');
        }
        CanvasTd = $('.td');
        CanvasTr.css('height', pixelSize);
        CanvasTd.css('width', pixelSize);
        isSmthOnCanvas = false;
        // Turning off the context menu over canvas
        Canvas.contextmenu(function () {
            return false;
        })
        // Adding a delay for avoid overloading browser by simultaneously animation
        if (body.hasClass('checked') == false) {
            setTimeout(function () {
                CanvasBgr.slideToggle(250);
            }, 700);
            // For hiding useless elements
            body.addClass('checked');
        }
        else {
            CanvasBgr.slideToggle(250);
        };
        drawing();
        manageHistory();
    }


    // This function manages canvas creation / removal
    function manageCanvas(functions) {
        let canvasIsExist = functions.isExist;
        let canvasIsNotExist = functions.isNotExist;
        if (CanvasBgr.css('display') == 'block') {
            PopUpBgr.addClass('visible');
            DelWindow.addClass('visible');
            NotifBtn.click(function () {
                NotifBtn.off('click');
                switch ($(this).attr('id')) {
                    case 'no-btn':
                        break;
                    case 'yes-btn':
                        if (pushedButton === 'clear') {
                            Canvas.attr('bgcolor', '');
                            BgrColor.attr('bgcolor', '');
                            BgrBtn.html('Add background');
                            hasBackground = false;
                            CanvasTd.attr('bgcolor', '');
                            isSmthOnCanvas = false;
                            pushedButton = 'delete';
                        }
                        else {
                            CanvasBgr.slideToggle(250);
                            setTimeout(function () {
                                Canvas.children().remove();
                                manageUndoRedoBtn();
                                // "Start drawing" button goes to the pulse mode
                                SubmitBtn.addClass('pulse');
                                if (canvasIsExist && typeof (canvasIsExist) === 'function') {
                                    canvasIsExist();
                                };
                            }, 500);
                        };
                        ClearBtn.html('Delete canvas');
                        manageHistory('clear');
                        break;
                    default:
                        break;
                }
                PopUpBgr.removeClass('visible');
                DelWindow.removeClass('visible');
            });
        }
        else {
            if (canvasIsNotExist && typeof (canvasIsNotExist) === 'function') {
                canvasIsNotExist();
            };
        };
    }


    function clearStatus() {
        if (isSmthOnCanvas) {
            pushedButton = 'clear';
        }
        else {
            pushedButton = 'delete';
        };
        manageCanvas({ isNotExist: function () { showPopUp('delete') } });
    }

    // Scrolling to top of info-window
    function instrScrollTop() {
        InstrBody.animate({ scrollTop: 0 });
    }

    // <<<<<< End of function declaration section <<<<<<



    // >>>>>> Activation of functions section >>>>>>

    // Enable information button tracking
    HintBtn.click(function () {
        showPopUp('readme');
        HintBtn.removeClass('hints-pulse')
    })

    // Enable smoothly scrolling to top of the info-window
    BackToTop.click(function () {
        instrScrollTop();
    })

    // Enable undo-redo buttons tracking
    UndoRedoBtns.click(function () {
        undoRedo({ btn: $(this) });
    });

    // Enable grid checkbox tracking
    CanvasGrid.on('change', function () {
        manageGrid();
    });

    // Enable background button tracking
    BgrBtn.click(function () {
        manageBackground();
    });

    // Enable eyedropper button tracking
    EyedrBtn.click(function () {
        manageEyedropper();
    });

    // Take initial color from #color-picker-1
    CurrColor.attr('bgcolor', $('#color-picker-49').val());

    // Required to react to mouse interaction with "color" forms
    ColorForm.on('change click', function () {
        CurrColor.attr('bgcolor', $(this).val());
    });

    // Enable keyboard tracking
    keyboardTracking();

    // Enable form tracking
    isFormFocused();

    // React to "Start drawing!" button
    // Avoiding default reload function
    // and calling manageCanvas() and secondary functions instead
    SizeForm.submit(function (event) {
        event.preventDefault();
        hideHeader();
        manageCanvas({
            isExist: function () { makeCells() },
            isNotExist: function () { makeCells() }
        });
    });

    // React to "clear" button
    ClearBtn.click(function () {
        clearStatus();
    });

    // <<<<<< End of activation of functions section <<<<<<
})