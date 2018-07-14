import { Mock } from './index';

class A {
  firstName: () => 'foo';
  lastName: () => ({ age: 25 });
}

interface DOB {
  month: number;
  year: number;
}

interface Person {
  attrs: {
    age: number;
    dateOfBirth: DOB;
    getDOB: () => DOB;
    height: {
      inches: () => number;
    };
  };
}

Mock.of<A>({ firstName: () => true }); // firstName: () => string;

// years does not return number
Mock.of<{ attrs: { age: number; years: () => number } }>({ attrs: { age: 25, years: () => '3' } });

// firstname does not return string
Mock.extend(new A()).with({
  firstName: () => 22222
});

// inches does not return number
Mock.of<Person>({
  attrs: {
    age: 100,
    height: {
      inches: () => true
    }
  }
});
