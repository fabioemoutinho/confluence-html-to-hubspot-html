import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { tap } from 'rxjs';

enum LANGUAGES {
  java = 'javascript',
  html = 'html',
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
    return htmlString
      .replace(/<\/?span[^>]*>/g, '') // remove span, but keep content
      .replace(
        /<\s*pre.*?data-syntaxhighlighter-params=\"brush: (.*?); [^"]*\".*?>/g,
        (match, p1: keyof typeof LANGUAGES) => {
          const language: string = this.languages[p1] ?? 'javascript';
          return `<pre class="language-${language}">`;
        }
      ) // replace attributes inside <pre>
      .replace(/(<pre.*?>)([^]*?)(<\/pre>)/g, '$1<code>$2</code>$3') // wrap content inside <pre> with <code>
      .replace(/<\/?div[^>]*>/g, ''); // remove div, but keep content
  }
}
