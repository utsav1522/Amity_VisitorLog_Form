import { z } from "zod";

const vehicleRegex = /^([A-Z]{2}[ -]?[0-9]{1,2}[ -]?[A-Z]{1,3}[ -]?[0-9]{1,4})?$/;
const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const aadharRegex = /^\d{12}$/;

const isVendorMaintenance = (data) =>
  data.visitorType === "Vendor" && data.purposeOfVisit === "Maintenance";

export const visitorSchema = z
  .object({
    fullName: z.string().trim().min(3, "Full name must have at least 3 characters."),
    mobileNumber: z
      .string()
      .trim()
      .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits."),
    emailId: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || z.string().email().safeParse(value).success, {
        message: "Enter a valid email address.",
      }),
    visitorType: z.string().min(1, "Please select a visitor type."),
    visitorTypeOther: z.string().trim().optional().or(z.literal("")),
    purposeOfVisit: z.string().min(1, "Please select purpose of visit."),
    purposeOfVisitOther: z.string().trim().optional().or(z.literal("")),
    entryGate: z.string().min(1, "Please select an entry gate."),
    department: z.string().min(1, "Please select a department."),
    num_of_visitors: z
      .number({ invalid_type_error: "Please enter a valid number." })
      .int("Must be a whole number.")
      .min(1, "At least 1 visitor required."),
    expectedHours: z
      .number({ invalid_type_error: "Please enter a valid number." })
      .int("Must be a whole number.")
      .min(1, "Minimum 1 hour.")
      .max(24, "Maximum 24 hours."),
    profilePhoto: z.string().min(1, "Profile photo is required."),
    vehicleNumber: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine((value) => !value || vehicleRegex.test(value), {
        message: "Vehicle number must be in uppercase format (e.g. DL 01 AB 1234).",
      }),
    gov_id_type: z.string().optional().or(z.literal("")),
    gov_id_number: z.string().trim().optional().or(z.literal("")),
    latitude: z.number({ invalid_type_error: "Location is required." }),
    longitude: z.number({ invalid_type_error: "Location is required." }),
    date: z.string().min(1),
    time: z.string().min(1),
    entryTime: z.string().min(1),
  })
  .superRefine((data, ctx) => {
    if (data.visitorType === "Other" && !data.visitorTypeOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the visitor type.",
        path: ["visitorTypeOther"],
      });
    }
    if (data.purposeOfVisit === "Other" && !data.purposeOfVisitOther?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the purpose of visit.",
        path: ["purposeOfVisitOther"],
      });
    }
    if (isVendorMaintenance(data)) {
      if (!data.gov_id_type?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a Government ID type.",
          path: ["gov_id_type"],
        });
      }
      if (!data.gov_id_number?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Government ID number is required.",
          path: ["gov_id_number"],
        });
      } else if (data.gov_id_type === "Aadhar" && !aadharRegex.test(data.gov_id_number)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Aadhar number must be exactly 12 digits.",
          path: ["gov_id_number"],
        });
      } else if (data.gov_id_type === "PAN" && !panRegex.test(data.gov_id_number.toUpperCase())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "PAN must be in format: ABCDE1234F.",
          path: ["gov_id_number"],
        });
      }
    }
  });
