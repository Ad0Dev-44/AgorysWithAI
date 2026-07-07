import {
  BarChart3,
  TrendingUp,
  Bot,
  FileText,
} from "lucide-react";

const features = [
  {
    title: "Analytics Dashboard",
    description:
      "Visualize your data with interactive charts and real-time insights.",
    icon: BarChart3,
  },
  {
    title: "Forecasting",
    description:
      "Predict future trends using advanced forecasting models.",
    icon: TrendingUp,
  },
  {
    title: "AI Recommendations",
    description:
      "Get intelligent suggestions based on your datasets.",
    icon: Bot,
  },
  {
    title: "Report Generation",
    description:
      "Automatically create professional reports from your analysis.",
    icon: FileText,
  },
];

export function Features() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center mb-12">
          Features
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="
                  bg-white
                  rounded-2xl
                  p-6
                  shadow-sm
                  border
                  hover:shadow-lg
                  transition
                "
              >

                <div className="
                  w-12 h-12
                  rounded-xl
                  bg-blue-100
                  flex
                  items-center
                  justify-center
                  mb-5
                ">
                  <Icon className="text-blue-600" />
                </div>


                <h3 className="text-xl font-semibold mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-600">
                  {feature.description}
                </p>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}


// export function Features() {
//   return (
//     <section className="py-16">
//       <h2 className="text-3xl font-bold mb-6">Features</h2>
//       <ul className="space-y-2">
//         <li>📊 Analytics Dashboard</li>
//         <li>📈 Forecasting</li>
//         <li>🤖 AI Recommendations</li>
//         <li>📑 Report Generation</li>
//       </ul>
//     </section>
//   );
// }