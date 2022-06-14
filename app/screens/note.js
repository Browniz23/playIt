const teoria = require('teoria');

var A4 = teoria.note('a4');
console.log(A4.key());
console.log(teoria.note.fromKey(20));
console.log(teoria.note.fromKey(20).coord[0]);
console.log(teoria.note('a1').key(true), teoria.note('a1').coord);
console.log(teoria.note('c1').key(), teoria.note('c1').coord);
console.log(teoria.note('b0').key(true), teoria.note('b0').coord);
console.log(teoria.note.fromKey(2).key());
console.log("-------------------");
var a = teoria.note('a1', { value: 1 });
var b = teoria.note('b2', { value: 2 });
var c = teoria.note('c3', { value: 4 });
var d = teoria.note('d4', { value: 2 });
var e = teoria.note('a#1', { value: 1 });
var f = teoria.note('f#2', { value: 2 });
var g = teoria.note('c#3', { value: 4 });
var h = teoria.note('d#4', { value: 2 });
console.log(e.toString(), e.key());
console.log(f.name(), f.key());
console.log(g.name(), g.key());
console.log(h.name(), h.key());
var arr = ['a','b','c','d','e'];
for (var i in arr) {
  console.log(i);
}
console.log(i);

var x = 5;
setTimeout(() => {
  console.log(x);
}, 0);
x = 7;
console.log(x);

var ch = teoria.chord('g',6);
for (i in ch.notes()) {
  console.log(ch.notes()[i].toString(), ch.notes()[i].duration.value);
}
console.log(teoria.note.fromKey(0).toString());
console.log(teoria.note.fromKey(-1).toString());
// var ach = a.chord('min');
// for (i in ach.notes()) {
//   console.log(ach.notes()[i].toString());
// }
