const steps = [
  {
    number: "01",
    title: "Upload your datasets",
    description:
      "Import your business data securely."
  },
  {
    number: "02",
    title: "Analyze and visualize",
    description:
      "Our platform transforms data into insights."
  },
  {
    number: "03",
    title: "Generate forecasts",
    description:
      "Use AI models to predict future trends."
  },
  {
    number: "04",
    title: "Receive recommendations",
    description:
      "Get actionable suggestions."
  }
];


export function HowItWorks() {

return (
<section className="py-24">

<div className="max-w-5xl mx-auto px-6">

<h2 className="text-4xl font-bold text-center mb-12">
How It Works
</h2>


<div className="grid md:grid-cols-4 gap-8">

{steps.map(step => (

<div key={step.number}
className="text-center">

<div className="
mx-auto
w-16 h-16
rounded-full
bg-blue-600
text-white
flex
items-center
justify-center
text-xl
font-bold
mb-5
">
{step.number}
</div>


<h3 className="font-semibold text-lg">
{step.title}
</h3>


<p className="text-gray-600 mt-2">
{step.description}
</p>

</div>

))}

</div>

</div>

</section>
)

}

// export function HowItWorks() {
//   return (
//     <section className="py-16">
//       <h2 className="text-3xl font-bold mb-6">
//         How It Works
//       </h2>

//       <ol className="list-decimal pl-6 space-y-2">
//         <li>Upload your datasets.</li>
//         <li>Analyze and visualize data.</li>
//         <li>Generate forecasts.</li>
//         <li>Receive recommendations.</li>
//       </ol>
//     </section>
//   );
// }