import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-docs',
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.css']
})
export class DocsComponent implements OnInit {

  public eq1 = '$P_{chg}=$';
  public eq2 = '$P_{qck}=$';
  public eq3 = '$CT_{chg}=$';
  public eq4 = '$CT_{qck}=$';
  public eq5 = '$ChT=E_{used}\\frac{CT_{qck}}{E_{gain}}$';
  public eq6 = '$E_{gain}=$';
  public eq7 = '$E_{used}=$';
  public eq8_1 = '$$P_{moveset}=\\frac{P_{qck}}{CT_{qck}}ChT+P_{chg}\\label{a}\\tag{1.1}$$';
  public eq9_2 = '$$PPS_{moveset}=\\frac{P_{moveset}}{ChT+CT_{chg}}\\label{b}\\tag{1.2}$$';
  public eq10_3 = '$$DPS_{chg}=\\frac{Floor{(\\frac12\\ast P_{chg}\\ast\\frac{Atk}{Def}\\ast STAB\\ast Effective)}+1}{ChT+CT_{chg}}\\label{c}\\tag{1.3}$$';
  public eq11_4 = '$$D_{qck}=Floor{(\\frac12\\ast P_{qck}\\ast\\frac{Atk}{Def}\\ast STAB\\ast Effective)}+1\\label{d}\\tag{1.4}$$';
  public eq12_5 = '$$DPS_{qck}=\\frac{{(\\frac{D_{qck}}{CT_{qck}})}ChT}{ChT+CT_{chg}}\\label{e}\\tag{1.5}$$';
  public eq13_6 = '$$DPS_{tot}=DPS_{qck}+DPS_{chg}\\label{f}\\tag{1.6}$$';

  public teq1_1 = '$$Health=(HP_{Base}+HP_{IV})CPM\\label{g}\\tag{2.1}$$';
  public teq2_2 = '$$DPS_{moveset}=\\frac{{(D_{qck}-1)}\\frac{ChT}{CT_{qck}}+{(D_{chg}-1)}+{(\\frac{ChT}{CT_{qck}}+1)}}{ChT+CT_{chg}}\\label{h}\\tag{2.2}$$';
  public teq3_3 = '$$D_{qck}-1=Floor{(\\frac12\\ast P_{qck}\\ast\\frac{Atk}{Def}\\ast STAB\\ast Effective)}\\label{i}\\tag{2.3}$$';
  public teq4_4 = '$$D_{chg}-1=Floor{(\\frac12\\ast P_{chg}\\ast\\frac{Atk}{Def}\\ast STAB\\ast Effective)}\\label{j}\\tag{2.4}$$';
  public teq5 = '$Atk=(Atk_{Base}+Atk_{IV})CPM_{Attacker}$';
  public teq6 = '$Def=(Def_{Base}+Def_{IV})CPM_{Defender}$';
  public teq7_5 = '$$FT=\\frac{Health}{DPS}\\label{k}\\tag{2.5}$$';
  public teq8_6 = '$$D_1=Floor{(\\frac12\\ast P_{qck}\\ast Atk\\ast STAB\\ast Effective)}\\label{l}\\tag{2.6}$$';
  public teq9_7 = '$$D_2=Floor{(\\frac12\\ast P_{chg}\\ast Atk\\ast STAB\\ast Effective)}\\label{m}\\tag{2.7}$$';
  public teq10_8 = '$$DPS_{moveset}\\approx\\frac{\\frac1{Def}D_1\\frac{ChT}{CT_{qck}}+\\frac1{Def}D_2+{(\\frac{ChT}{CT_{qck}}+1)}}{ChT+CT_{chg}}\\label{n}\\tag{2.8}$$';
  public teq11_9 = '$$DPS_{moveset}\\approx\\frac1{Def}\\frac{D_1\\frac{ChT}{CT_{qck}}+D_2+{(\\frac{ChT}{CT_{qck}}+1)}}{ChT+CT_{chg}}=\\frac1{Def}f{(P,Atk,STAB,Effective,CT)}\\label{o}\\tag{2.9}$$';
  public teq12_10 = '$$FT\\approx\\frac{Health\\ast Def}{f{(P,Atk,STAB,Effective,CT)}}\\label{p}\\tag{2.10}$$';
  public teq13_11 = '$$\\mathrm T=\\frac{Health\\ast Def}{1000}=\\frac{(HP_{Base}+HP_{IV})(Def_{Base}+Def_{IV})CPM^2}{1000}\\label{q}\\tag{2.11}$$';

  constructor() { }

  ngOnInit() { }

}
