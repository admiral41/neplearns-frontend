// Require Editor JS files.
import React from "react";
import "froala-editor/js/froala_editor.pkgd.min.js";

// Require Editor CSS files.
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";

// Require Font Awesome.
// import '@fortawesome/fontawesome-free/css/all.min.css'

import "froala-editor/js/plugins/align.min.js";
import "froala-editor/js/plugins/char_counter.min.js";
import "froala-editor/css/plugins/char_counter.min.css";
import "froala-editor/js/plugins/code_view.min.js";
import "froala-editor/css/plugins/code_view.min.css";
import "froala-editor/js/plugins/draggable.min.js";
import "froala-editor/css/plugins/draggable.min.css";
import "froala-editor/js/plugins/emoticons.min.js";
import "froala-editor/css/plugins/emoticons.min.css";
import "froala-editor/js/plugins/file.min.js";
import "froala-editor/css/plugins/file.min.css";
import "froala-editor/js/third_party/font_awesome.min.js";
import "froala-editor/js/plugins/font_family.min.js";
import "froala-editor/js/plugins/font_size.min.js";
import "froala-editor/js/plugins/fullscreen.min.js";
import "froala-editor/css/plugins/fullscreen.min.css";
import "froala-editor/js/plugins/help.min.js";
import "froala-editor/css/plugins/help.min.css";
import "froala-editor/js/plugins/image.min.js";
import "froala-editor/css/plugins/image.min.css";
import "froala-editor/js/plugins/line_height.min.js";
import "froala-editor/js/plugins/link.min.js";
import "froala-editor/js/plugins/lists.min.js";
import "froala-editor/js/plugins/paragraph_format.min.js";
import "froala-editor/js/plugins/quick_insert.min.js";
import "froala-editor/css/plugins/quick_insert.min.css";
import "froala-editor/js/plugins/quote.min.js";
// import 'froala-editor/js/third_party/spell_checker.min.js'
// import 'froala-editor/css/third_party/spell_checker.min.css'
import "froala-editor/js/plugins/table.min.js";
import "froala-editor/css/plugins/table.min.css";
import "froala-editor/js/plugins/url.min.js";
import "froala-editor/js/plugins/video.min.js";
import "froala-editor/css/plugins/video.min.css";
// import './customStyles.css'
import FroalaEditor from "react-froala-wysiwyg";
import { editorConfig } from "./Config";

function ContentEditor({ model, handleModelChange, allowPaste }) {
  return (
      <FroalaEditor
          tag="textarea"
          config={editorConfig(allowPaste)}
          model={model}
          onModelChange={handleModelChange}
          style={{ marginTop: '20px', height: '50vh', overflowY: 'auto' }} 
      />
  );
}

export default ContentEditor;
