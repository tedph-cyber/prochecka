export const AI_FUNCTIONS = [
  {
    name: "start_assessment",
    description: "Begin diabetes risk assessment when user expresses interest",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "Why user wants assessment",
        },
      },
    },
  },
  {
    name: "record_health_metric",
    description: "Record a health metric shared by user",
    parameters: {
      type: "object",
      properties: {
        metric: {
          type: "string",
          enum: [
            "pregnancies",
            "glucose",
            "blood_pressure",
            "bmi",
            "age",
            "insulin",
          ],
        },
        value: {
          type: "number",
        },
        confidence: {
          type: "string",
          enum: ["high", "medium", "low"],
        },
      },
      required: ["metric", "value"],
    },
  },
  {
    name: "provide_diabetes_info",
    description: "User asks general question about diabetes",
    parameters: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: ["symptoms", "prevention", "diet", "exercise", "medication"],
        },
      },
    },
  },
  {
    name: "calculate_risk",
    description: "Calculate diabetes risk when all metrics collected",
    parameters: {
      type: "object",
      properties: {
        ready: {
          type: "boolean",
        },
      },
    },
  },
];
