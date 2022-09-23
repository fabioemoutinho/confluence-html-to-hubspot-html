import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { tap } from 'rxjs';

enum LANGUAGES {
  java = 'javascript',
  html = 'html',
}

enum PANEL_CLASSES {
  information = 'info',
  note = 'warn',
  warning = 'error',
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  readonly form = this.fb.group({
    input: [''],
    output: [''],
  });
  private readonly languages = LANGUAGES;
  private readonly panelClasses = PANEL_CLASSES;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form.controls.input.valueChanges
      .pipe(
        tap((input) => {
          this.form.controls.output.setValue(this.clearHtml(input!));
        })
      )
      .subscribe();
  }

  clearHtml(htmlString: string): string {
    return (
      htmlString
        // remove span, but keep content
        .replace(/<\/?span[^>]*>/g, '')
        // replace attributes inside <pre>
        .replace(
          /<\s*pre.*?data-syntaxhighlighter-params=\"brush: (.*?); [^"]*\".*?>/g,
          (match, p1: keyof typeof LANGUAGES) => {
            const language: string = this.languages[p1] ?? 'javascript';
            return `<pre class="language-${language}">`;
          }
        )
        // wrap content inside <pre> with <code>
        .replace(/(<pre.*?>)([^]*?)(<\/pre>)/g, '$1<code>$2</code>$3')
        // prevent HubSpot from evaluating HubL Syntax https://developers.hubspot.com/docs/cms/hubl
        .replace(/{%([^]*?)%}/g, '{% raw %}{%$1%}{% endraw %}')
        .replace(/{{([^]*?)}}/g, '{% raw %}{{$1}}{% endraw %}')
        // remove info/warn/error block body div
        .replace(
          /<div class="confluence-information-macro-body">([^]*?)<\/div>/g,
          '$1'
        )
        // replace info/warn/error block container div with keep tag before removing all divs
        .replace(
          /<div class="confluence-information-macro confluence-information-macro-(.*?)">([^]*?)<\/div>/g,
          (match, p1: keyof typeof PANEL_CLASSES, p2: string) => {
            const panelClass: string = this.panelClasses[p1] ?? 'info';
            return `<keep class="panel-${panelClass}">${p2}</keep>`;
          }
        )
        // remove div, but keep content
        .replace(/<\/?div[^>]*>/g, '')
        // replace <keep> with <div>
        .replace(
          /<keep class="(.*?)">([^]*?)<\/keep>/g,
          '<div class="$1">$2</div>'
        )
    );
  }
}
