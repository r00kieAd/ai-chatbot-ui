// import React, {useEffect} from "react";

class TextAreaHeight {
    css: any = getComputedStyle(document.documentElement);
    getHeightValues() {
        const textareaHeight = this.css.getPropertyValue('--textAreaHeight');
        const textareaMaxHeight = this.css.getPropertyValue('--textAreaMaxHeight');
        return {textareaHeight, textareaMaxHeight};
    }
};

export default TextAreaHeight;
