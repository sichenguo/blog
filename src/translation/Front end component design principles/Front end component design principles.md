# Front end component design principles



![img](https://cdn-images-1.medium.com/max/1600/1*1aVlbiTIijIsTOGGjkpc0Q.jpeg)

*Photo by Kaboompics .com from Pexels*

### Preamble

Having used React for just over 3 years at my previous job, I recently started working at a company that uses Vue. While it was true that there was much to learn when switching between front end frameworks, there were multiple underlying, fundamental concepts that remained just as pertinent. One of which was the concept of component design, from their hierarchy down to their individual responsibilities.

One of the fundamental concepts of most modern front end frameworks, from React to Vue, to Ember and Mithril, and many more, is the concept of components. A component is typically a collection of markup, with potentially some logic and usually some styling. They are designed to be reusable, and to serve as the building blocks from which your application will ultimately be constructed.

Just like classes in a conventional OOP setting, components should have plenty of thought put into their design so that they can be reusable, composable, discrete and loosely coupled, but functional enough to be sufficient in and of themselves when leveraged within and outside their intended use cases. Such a design is easier said than done and we don’t always have time to plan things the way we want.

### Approach

In this article I wanted to cover some of the design concepts specific to components that you should consider when doing front end work. I figured the best approach would be to give each concept a pithy name that makes me sound smart, a description of what the concept is and why it’s important, and potentially an example to help illustrate it.

This list is certainly not comprehensive nor complete, but just 8 things I’ve noticed that are worth mentioning for those who can already write basic components but want to improve their technical design skills. So here is the list:

1. Hierarchy and class diagrams
2. Flat, data-oriented state/props
3. State change purity
4. Loose coupling
5. Auxiliary code separation
6. View distillation
7. Timely modularisation
8. Centralised state considerations

Please note that the code examples may have some minor issues or be a bit contrived. They’re not complex, real world examples meant to be copy pasted, but simply designed to exemplify a concept.

### Hierarchy and class diagrams

Your components collectively form a tree structure and it’s a good idea to create a visual representation of this tree during design. It helps you get a good overall idea of your application layout. A good way to represent these entities is component diagrams.

UML has a type that’s used in OOP class design, called a UML class diagram. This shows a classes properties and methods along with their access modifiers, the classes relationships with other classes, and so on. While designing OOP classes and front end components isn’t identical, this same diagrammatic approach can be leveraged. For front end components, the diagram can show:

- State
- Props
- Methods
- Relationship to other components

So, let’s take a look at a basic hierarchical component diagram plan for a simple table component that will render an array of data objects. The component will consist of a total row count display, a header row, some data rows, and the ability to sort on a column when clicking its header cell. In its props it will be passed the list of columns (which have a property name and a human readable version of that property), and then an array of data. We can add in an optional ‘on row click’ function for funsies.



![img](https://cdn-images-1.medium.com/max/1600/0*BpUkUiLupqoBO3ux)

While something like this may seem a bit much, and can definitely be quite involved for large applications, it has many advantages. A big one is that it forces you to think about specifics before you start writing any code, like what type of data each component needs, what methods it will have to implement, what the required state properties are, and so on.

Once you have the general idea of how to build a component (or group of components), it’s easy to think that when you actually start coding it’ll flesh itself all out neatly and as you expected, but there’ll almost always be things you didn’t accommodate for. You don’t want to have to redo parts of your project or use messy work arounds as a result. Other advantages to these diagrams include:

1. A easy to understand view of component composition and association
2. An easy to understand overview of your application UI hierarchy
3. A view of your hierarchy’s data and how it flows
4. A snapshot of a component’s functional responsibilities
5. Relatively easy to create using diagram software

I should mention that the above diagram isn’t based on some official standard like UML class diagrams are, it’s one I essentially made up. For example, I used Typescript syntax as the basis for data typing of props and methods’ parameter and return values. I haven’t found an official standard for front end components, likely due to the relatively new and fast paced ecosystem of front end Javascript development, though if anyone is aware of a mainstream standard please let me know in the responses!

### Flat, data-oriented state/props

State and props are watched and updated frequently. If you have nested data your performance can suffer, through things such as unnecessary re-rendering from shallow equality checks. In libraries which involve immutability, like React, you have to create copies of state rather than changing them directly like in Vue, and doing so with nested data can create awkward, ugly code.



![img](https://cdn-images-1.medium.com/max/1600/0*mZkPIHnDUAJqnggm)

That ain’t pretty, even with the spread operator. Flat props also make it nice and clear what data values a component is working with. If you pass in an object then you have no idea what its properties are, and so finding out what the props of the component *actually* are is extra work. But if you flatten the object out, it’s much quicker to see what you’re working with.



![img](https://cdn-images-1.medium.com/max/1600/0*oWFoKOVdtDEiOt5t)

The state/props should also contain just the data needed to render your markup. You shouldn’t store entire components in the state/props and render straight from there.

(In addition, for data heavy applications, data normalisation can have huge benefits and you may want to consider doing that in addition to flattening).

### State change purity

Changes to state should usually be in response to some kind of event, like the user clicking a button, or an API response returning. They shouldn’t be in response to other state changes, as this chaining can create component behaviour that is hard to understand and maintain. State changes should be free of side effects.

This problem can be seen in Vue if you misuse `watch`, rather than baking that logic into whatever event handler deals with the state changing in the first place. Let’s look at a basic Vue example. I was working on a component which fetches some data from an API and renders it to a table. Everything like sorting, filtering and such was done back end, so we had a series of watchers which watched all of those search parameters on the front end and triggered an API call when they changed. One such value was “zone”, which was a filter. When that changed, we wanted to re-fetch the data with that new filter value. So a simple watcher had been set up for it:



![img](https://cdn-images-1.medium.com/max/1600/0*gmnqOd2JMQwEn0sm)

You’ll notice something weird. If they were beyond the first page of results, we reset the page number and…return?! That doesn’t seem right. If they weren’t on the first page we should reset the pagination AND trigger an API call, right? Why do we only re-fetch the data if they’re on page 1? Well turns out there was a reason, here’s the full watch property:



![img](https://cdn-images-1.medium.com/max/1600/0*93mIcG6EdFJUcAvb)

When the pagination changes it fetches the data too, through the pagination watcher. So if we changed the pagination, we didn’t need to trigger an API search since the pagination watcher did that already.

Let’s think of the flow: if they were beyond page 1 and changed zone, it would trigger a state change, which would trigger a state change, which would re-fetch the data. This isn’t predictable behaviour and produces code that isn’t intuitive.

The solution is that the event handler for paging (not a watcher, the actual handler for the user changing the page) should change the page value **and**trigger the API call. This would also remove the need for a watcher. With such a setup, changing the pagination state directly from elsewhere won’t also cause the side effect of re-fetching the data.

While this example is **VERY** simple, it’s not hard to see how chaining together more complex state changes could create very hard to understand code that’s not extendable and a nightmare to debug.

### Loose coupling

A core idea of components is that they are reusable, and for that they have to be functional and complete in and of themselves. ‘Coupling’ is a term which refers to the dependence of entities on one another. Loosely coupled entities should be able to function by themselves, without relying on other modules. In terms of front end components, the main part of coupling is how much a component’s functionality relies on its parent and the props it’s passed, and what children it renders (as well as imports, like 3rd party modules or custom scripts).

Tightly coupled components tend to be more work to reuse, don’t function properly when not children of their original parent component, have a child or series of children that only make sense in their original context, and lead to code duplication as they are overfitted to their original use case.

When designing a component you should try and think of a general use case, rather than the specific use case it was originally made to satisfy. While some components are obviously going to be for a specific purpose only, and that’s ok, plenty will have wider applicability if you approach them with a broad view when designing them.

Let’s have a look at a simple React use case where you want to make a list of links for navigating around your site, with a logo displayed. In this case we’ll be looking at unbinding a component from the context it was originally designed. Here’s the initial version:



![img](https://cdn-images-1.medium.com/max/1600/0*YdWfhl9HILY99Di0)

While this may fulfil the initial intended use case, it’s not reusable in any situation except the initial context it was made for. What if you want to have different links depending on whether they’re an admin or not? You’d have to copy paste this and change the routes. And let’s say you know you’re wanting to implement a functionality wherein users could customise their links. You can’t realistically hardcode that since there could be all sorts of combinations. Let’s make a more reusable component:



![img](https://cdn-images-1.medium.com/max/1600/0*SRwtEhiEfcFEneFa)

Here we can see that while it does have the original links and logo as the default values, we can pass in props to override them. So let’s say we want to use create special use case for admins:



![img](https://cdn-images-1.medium.com/max/1600/0*bgK5B8oRXhMQJQWG)

No need for a new component! And we can dynamically build that link array too if we wanted, which solves our use case of users having custom link lists. Furthermore, while not addressed in this specific example, we can still note that this component isn’t bound to any specific parent nor children. It can be rendered wherever it’s needed. Now this component is much more reusable beyond its original context.

Assuming it doesn’t serve a highly specific, one-off use case, the ultimate goal of designing a component is that it be loosely coupled from its parent, renders generic and logical child elements, and not be bound to the context from which it originated.

### Auxiliary code separation

This one may be less academic, but I still feel it’s important enough to mention. Physically interacting with your code base is part of software engineering, and sometimes some basic organisational principles can really make things smoother. When working on a code base for 8 hours a day for weeks, small changes can make a big difference. One such organisational principle is the idea of separating out auxiliary code into its own file so that you don’t have to deal with it when working on your component. Such code includes, but is not limited to, things like:

- Configuration code
- Dummy data
- Large amounts of non-technical documentation

Not only is it messy and annoying to have to scroll over this stuff when trying to work on the core code of your component, it can exacerbate bias. When working on components you want them to be as generic and reusable as possible. Seeing the specific information pertaining to a component’s current context can make it difficult to think of the component’s usage beyond its original use case.

### View distillation

While it may be challenging, a good way to develop components is to make them contain the bare minimum Javascript needed to render them. Everything extraneous, like data fetching, data munging or event handling logic should ideally be made generic and moved into external scripts or lifted up into a common ancestor.

This boils the component down into the ‘view’ part of it, i.e. what you see (the markup and styling). The Javascript within it is only there to help render the view, with *maybe* a little extra logic specific to that component (i.e. used nowhere else). Anything beyond that, like API calls, non-specific formatting of values (e.g. currency or time) or munging of data that’s reused across components, can be moved to external scripts of lifted up. Let’s look at a simple example in Vue, using a nested list component. We can view the problematic version first.

This is the first level:



![img](https://cdn-images-1.medium.com/max/1600/0*P5gJwro7sZUhBr_7)

And here’s the nested list component:



![img](https://cdn-images-1.medium.com/max/1600/0*9nsuVNekUXJ24FEN)

Here we can see that both levels of this list have external dependencies, the top level importing a function from a script and data from a JSON file, the nested component being connected to the Vuex store and posting with axios. They also have embedded functionality that only applies to their current usage (the top level’s data processing and the nested list’s onClick functionality).

While there are some good general design techniques employed here such as moving the generic munging function to an external script and not embedding the hard coded data, this still isn’t very reusable. What if we want the exact same type of list, but have it fetch its data from an API? Or to have different behaviour when clicking on a nested item? We simply can’t without copy/pasting this into some new components and changing those features.

Let’s see if we can fix this by lifting up the data and making the event handling passed in as props, so that the components simply render the data and don’t encapsulate any other logic.

Here’s the new top level of the list:



![img](https://cdn-images-1.medium.com/max/1600/0*_OM8O-ONfOtk8mqP)

And the new second level:



![img](https://cdn-images-1.medium.com/max/1600/0*Kx5vgTwEMt8FmBdz)

With this new list, we get the data however we want and define the nested onClick handler to do whatever we want in the parent, then just pass them in as props to the top level component. That way, we don’t need to duplicate any of the components when leveraging them for new use cases, and we can leave the importing and logic to a single root component.

A nice, brief article on this topic can be found [here](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0). It’s written by Dan Abramov, co-creator of Redux, and is specifically in relation to React. However, it applies to general component design.

### Timely modularisation

While trying to be more proactive about breaking up your code into loosely coupled, reusable chunks is a good thing, it’s certainly possible to go overboard. Not every little bit of markup needs to be its own component, not every little bit of logic needs to be pulled out to an external script.

Here’s a few points to think of when deciding whether or not to separate code out, whether it be Javascript logic or a new component. Again, this list isn’t complete, but merely a few points to give you an idea of the sorts of things to think about. (Remember, just because it doesn’t satisfy one condition doesn’t mean it won’t satisfy others, so think about all before making a decision):

1. **Is there enough markup/logic to warrant it?** If it’s just a few lines of code, you could end up creating more code separating it than just leaving it in.
2. **Is the code repeated (or likely to be repeated)?** If something is used once and only once, and serves a specific use case that is unlikely to be used elsewhere, it can potentially be better just to leave it embedded. If need be you can always separate it out later (but do NOT use that as an excuse to never do it).
3. **Would it reduce your boilerplate?** For example, let’s say you wanted a tree of divs used for styling and some static content/functionality, with some variable content nested at the centre. By creating a reusable wrapper (like with React’s HOCs or Vue’s slots) you can reduce the boilerplate when creating multiple instances of these components, since you don’t need to copy/paste all the static wrapping code.
4. **Is your performance suffering?** Changing state/props causes re-rendering, and when this happens you only want the relevant elements to be diffed and re-rendered. In larger, undifferentiated components, you may find that state changes cause re-rendering in a whole lot of places where it isn’t needed, and your performance can start to suffer.
5. **Are you having trouble testing all parts of your code?** You want to be able to test a variety of things, like that components work regardless of their context, and that all your Javascript logic works as intended. This can be hard when your elements have a single, assumed context or if you embed a whole bunch of logic into a single function, respectively. Rendering tests can also become unwieldy if testing a single, giant component with lots of markup and styling.
6. **Do you have a clear rationale?** When splitting up your code you should be thinking about what exactly it achieves. Does this allow for looser coupling? Is the chunk I’m breaking off a discrete entity that logically makes sense being on its own? Is this code ever actually likely to be reused elsewhere? If you can’t answer this question clearly, then you’re just splitting up code into (potentially tightly coupled) chunks for the sake of it, which can cause problems.
7. **Do the benefits outweigh the cost?** Separating out code inevitably takes time and effort, the amount of which vary depending on the specific scenario, and there’s many factors which will come into play when ultimately making this decision (such as the points in this list, and many more). Doing some research on the cost and benefits of abstraction in general can help give you an idea of some factors to keep in mind when making this decision for your code. Ultimately I included this point because it’s easy to forget the effort required if we focus too hard on the advantages. Weigh everything up and make an informed decision.

### Centralised/shared state accommodation

A lot of larger applications use centralised store tools like Redux or Vuex (or have state sharing setups like React’s Context API). This means they’re getting props from the store and not passed in via the parent. When thinking about reusability of components you always need to consider not only the direct, parental props, but the store ones too. If you used that component in another project, you’d need those values in the store. Or maybe the other project doesn’t use a centralised store tool at all, and you’d have to transpile it into a form where those are now passed as parental props.

Since hooking a component up to the store (or context provider) is easy and can be done regardless of the component’s hierarchical location, it’s easy to quickly create a lot of tight coupling between the store and a web of components all over your hierarchy. Usually hooking up the component to the store is just a few lines, then it’s a single extra line for each property/function you attach. Just remember that while this kind of coupling may be easy, it’s implications are no different, and you should think through ways to mitigate the risk just as you would with parental props.

### Final thoughts

I want to finish with a brief reminder about real world application of these principles, or indeed any best practices you may read about. While you should do your best to uphold good design and not compromise code integrity for the sake of wrapping up a JIRA ticket or closing a pull request, at the same time people who always hold theory above real world outcomes also tend to have their work suffer. Large software projects have a lot of moving parts, and there are many facets of software engineering that don’t specifically relate to coding but are nonetheless integral, such as adhering to deadlines and dealing with non-technical expectations.

While adequate preparation is important and should be a part of any professional software design, in the real world tangible results are paramount. When you’re employed to actually create something, your employer won’t be too happy if, when the deadline rolls around, you have an amazing **plan** of how to build the product perfectly, with no actual development done. Besides, things in software engineering rarely go exactly according to plan so excessively specific plans can often start to become counter-productive in terms of time usage.

In addition, the concepts from component planning and design also apply to component refactoring. While taking 50 years to plan everything in excruciating detail and then writing it all perfectly from the get go would be nice, back here in the real world when crunch time rolls around you may find yourself designing components and writing code in less than optimal ways. However, once the pressure is relieved and you have the time, it’s always a good idea to go back and refactor earlier code that wasn’t ideally built, so that it serves as a robust foundation on which to move forward.

At the end of the day, while your immediate responsibilities may be “to write code”, you shouldn’t lose sight of your ultimate goal, which is to build something. To create a product. To generate something that you can be proud of and that helps people, even if it’s technically not perfect. Because nothing ever is. Always remember to find a balance. Staring at a code base 8 hours a day for weeks on end unfortunately catalyzes a narrow, myopic view of the project more often than not, but it’s up to you to take a step back when needed and make sure you don’t miss the forest for the trees.