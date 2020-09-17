/* 
 * MIT License
 * 
 * Copyright (c) 2020 Nolonar
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//=============================================================================
// Metadata
//=============================================================================
/*:
 * @target MZ
 * @plugindesc Automatically replaces some text with some other text.
 * @author Nolonar
 * @url https://github.com/Nolonar/RM_Plugins
 * 
 * @param shortcuts
 * @text Shortcuts
 * @desc The texts to replace with other texts.
 * @type struct<shortcut>[]
 * @default ["{\"toMatch\":\".\",\"replacement\":\".\\\\|\"}","{\"toMatch\":\"!\",\"replacement\":\"!\\\\|\"}","{\"toMatch\":\"?\",\"replacement\":\"?\\\\|\"}", "{\"toMatch\":\",\",\"replacement\":\",\\\\.\"}"]
 * 
 * 
 * @help Version 1.0.0
 * 
 * This plugin does not provide plugin commands.
 * 
 * This plugin automatically replaces text from "Show Text..." event commands.
 * The default replacement patterns are:
 *      ,       ->      ,\.         Adds 1/4 second pause after comma.
 *      .       ->      .\|         Adds 1 second pause after dot.
 *      !       ->      !\|         Adds 1 second pause after exclamation mark.
 *      ?       ->      ?\|         Adds 1 second pause after question mark.
 * 
 * This allows to write more dynamic looking text without worrying too much
 * about adding escape characters everywhere.
 * 
 * Control character reference:
 *      \v[n]           Replaced by the value of the nth variable.
 *      \n[n]           Replaced by the name of the nth actor.
 *      \p[n]           Replaced by the name of the nth party member.
 *      \g              Replaced by the currency unit.
 *      \c[n]           Draw the subsequent text in the nth color.
 *      \i[n]           Draw the nth icon.
 *      \{              Increase the text size by one step.
 *      \}              Decrease the text size by one step.
 *      \\              Replaced with the backslash character.
 *      \$              Open the gold window.
 *      \.              Wait 1/4 second.
 *      \|              Wait 1 second.
 *      \!              Wait for button input.
 *      \>              Display remaining text on same line all at once.
 *      \<              Cancel the effect that displays text all at once.
 *      \^              Do not wait for input after displaying text.
 */

/*~struct~shortcut:
 * @param toMatch
 * @text Text to match
 * @type string
 * 
 * @param replacement
 * @text Replacement text
 * @type string
 */

(() => {
    const PLUGIN_NAME = "N_AutoTextReplace";

    const parameters = PluginManager.parameters(PLUGIN_NAME);
    parameters.shortcuts = parseShortcuts(parameters.shortcuts);

    const defaultShortcuts = [
        {
            toMatch: ".",
            replacement: ".\\|"
        },
        {
            toMatch: "!",
            replacement: "!\\|"
        },
        {
            toMatch: "?",
            replacement: "?\\|"
        },
        {
            toMatch: ",",
            replacement: ",\\."
        }
    ];

    function parseShortcuts(string) {
        const shortcuts = string ? JSON.parse(string).map(s => JSON.parse(s)) : defaultShortcuts;
        return {
            from: new RegExp(shortcuts.map(s => `(${escapeRegExp(s.toMatch)})`).join("|"), "g"),
            to: match => shortcuts.find(s => s.toMatch === match).replacement
        };
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    const Window_Base_convertEscapeCharacters = Window_Base.prototype.convertEscapeCharacters;
    Window_Base.prototype.convertEscapeCharacters = function (text) {
        text = text.replace(parameters.shortcuts.from, parameters.shortcuts.to);
        return Window_Base_convertEscapeCharacters.call(this, text);
    };

})();
