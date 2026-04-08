import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DEPARTMENTS,
  ENTRY_GATES,
  GOV_ID_TYPES,
  PURPOSE_OPTIONS,
  VISITOR_TYPES,
} from "../constants/formOptions";
import { LocationPicker } from "../components/LocationPicker";
import { visitorSchema } from "./visitorSchema";

const SelectField = ({
  id,
  label,
  required,
  register,
  error,
  options,
  disabled,
  readOnly,
  value,
}) => (
  <div className="field-group">
    <label htmlFor={id} className="field-label">
      {label}
      {required && <span className="required-mark">*</span>}
    </label>
    {readOnly ? (
      <input
        id={id}
        type="text"
        value={value || "N/A"}
        readOnly
        className="field-input readonly-input"
      />
    ) : (
      <select
        id={id}
        {...register(id)}
        className={`field-input ${error ? "field-error" : ""}`}
        disabled={disabled}
      >
        <option value="">-Please select-</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )}
    {error && <p className="error-text">{error.message}</p>}
  </div>
);

const InputField = ({
  id,
  label,
  placeholder,
  required,
  register,
  registerOptions,
  error,
  disabled,
  readOnly,
  type = "text",
  min,
}) => (
  <div className="field-group">
    <label htmlFor={id} className="field-label">
      {label}
      {required && <span className="required-mark">*</span>}
    </label>
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      {...register(id, registerOptions)}
      className={`field-input ${error ? "field-error" : ""}`}
      min={min}
      disabled={disabled}
      readOnly={readOnly}
    />
    {error && <p className="error-text">{error.message}</p>}
  </div>
);

const ProfilePhotoField = ({ value, onChange, error, disabled, readOnly }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return; // 5 MB limit

      const reader = new FileReader();
      reader.onloadend = () => onChange(reader.result);
      reader.readAsDataURL(file);
    },
    [onChange],
  );

  const handleRemove = useCallback(() => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onChange]);

  return (
    <div className="field-group">
      <label className="field-label">
        Profile Photo<span className="required-mark">*</span>
      </label>
      {value ? (
        <div className="photo-preview-wrap">
          <img src={value} alt="Profile preview" className="photo-preview" />
          {!readOnly && !disabled && (
            <button type="button" className="photo-remove-btn" onClick={handleRemove}>
              Remove
            </button>
          )}
        </div>
      ) : (
        <>
          {readOnly ? (
            <span className="muted-text">No photo</span>
          ) : (
            <button
              type="button"
              className="photo-upload-btn"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Photo
            </button>
          )}
        </>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="photo-file-input"
        onChange={handleFileChange}
        disabled={disabled || readOnly}
      />
      {error && <p className="error-text">{error.message}</p>}
    </div>
  );
};

export const VisitorForm = ({
  defaultValues,
  onSubmit,
  loading,
  submitLabel,
  infoText,
  onCancel,
  readOnlyMode = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: readOnlyMode ? undefined : zodResolver(visitorSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const dateValue = watch("date");
  const timeValue = watch("time");
  const visitorTypeValue = watch("visitorType");
  const purposeValue = watch("purposeOfVisit");
  const gateValue = watch("entryGate");
  const departmentValue = watch("department");
  const profilePhotoValue = watch("profilePhoto");
  const govIdTypeValue = watch("gov_id_type");

  const isVendorMaintenance =
    visitorTypeValue === "Vendor" && purposeValue === "Maintenance";

  // Clear "other" text when the parent dropdown changes away from "Other"
  useEffect(() => {
    if (visitorTypeValue !== "Other") setValue("visitorTypeOther", "", { shouldValidate: true });
  }, [visitorTypeValue, setValue]);

  useEffect(() => {
    if (purposeValue !== "Other") setValue("purposeOfVisitOther", "", { shouldValidate: true });
  }, [purposeValue, setValue]);

  // Clear gov ID fields when not vendor+maintenance
  useEffect(() => {
    if (!isVendorMaintenance) {
      setValue("gov_id_type", "", { shouldValidate: false });
      setValue("gov_id_number", "", { shouldValidate: false });
    }
  }, [isVendorMaintenance, setValue]);

  // Register profilePhoto so react-hook-form tracks it (set via setValue)
  useEffect(() => {
    register("profilePhoto");
    register("latitude");
    register("longitude");
  }, [register]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="visitor-form" noValidate>
      {infoText && <div className="form-banner">{infoText}</div>}

      <input type="hidden" {...register("entryTime")} />

      {/* ── Profile photo at top ── */}
      <ProfilePhotoField
        value={profilePhotoValue}
        onChange={(val) => setValue("profilePhoto", val, { shouldValidate: true })}
        error={errors.profilePhoto}
        disabled={loading}
        readOnly={readOnlyMode}
      />

      <InputField
        id="fullName"
        label="Full Name"
        placeholder="Enter full name"
        required
        register={register}
        error={errors.fullName}
        disabled={loading}
        readOnly={readOnlyMode}
      />

      <div className="field-group">
        <label htmlFor="mobileNumber" className="field-label">
          Mobile Number<span className="required-mark">*</span>
        </label>
        <div className="phone-wrap">
          <span className="phone-prefix">+91</span>
          <input
            id="mobileNumber"
            type="text"
            placeholder="Enter 10-digit mobile number"
            {...register("mobileNumber")}
            className={`field-input ${errors.mobileNumber ? "field-error" : ""}`}
            disabled={loading}
            readOnly={readOnlyMode}
          />
        </div>
        {errors.mobileNumber && <p className="error-text">{errors.mobileNumber.message}</p>}
      </div>

      <InputField
        id="emailId"
        label="Email ID"
        placeholder="Enter email"
        register={register}
        error={errors.emailId}
        disabled={loading}
        readOnly={readOnlyMode}
        type="email"
      />

      <SelectField
        id="visitorType"
        label="Visitor Type"
        required
        register={register}
        error={errors.visitorType}
        options={VISITOR_TYPES}
        disabled={loading || readOnlyMode}
        readOnly={readOnlyMode}
        value={visitorTypeValue}
      />

      {visitorTypeValue === "Other" && (
        <InputField
          id="visitorTypeOther"
          label="Specify Visitor Type"
          placeholder="Enter visitor type"
          required
          register={register}
          error={errors.visitorTypeOther}
          disabled={loading}
          readOnly={readOnlyMode}
        />
      )}

      {/* ── Number of visitors ── */}
      <InputField
        id="num_of_visitors"
        label="Number of Visitors"
        placeholder="e.g. 1"
        required
        register={register}
        registerOptions={{ valueAsNumber: true, min: 1 }}
        error={errors.num_of_visitors}
        disabled={loading}
        readOnly={readOnlyMode}
        type="number"
        min={1}
      />

      <InputField
        id="expectedHours"
        label="Expected Stay (Hours)"
        placeholder="e.g. 2"
        required
        register={register}
        registerOptions={{ valueAsNumber: true }}
        error={errors.expectedHours}
        disabled={loading}
        readOnly={readOnlyMode}
        type="number"
      />

      <SelectField
        id="purposeOfVisit"
        label="Purpose of Visit"
        required
        register={register}
        error={errors.purposeOfVisit}
        options={PURPOSE_OPTIONS}
        disabled={loading || readOnlyMode}
        readOnly={readOnlyMode}
        value={purposeValue}
      />

      {purposeValue === "Other" && (
        <InputField
          id="purposeOfVisitOther"
          label="Specify Purpose of Visit"
          placeholder="Enter purpose of visit"
          required
          register={register}
          error={errors.purposeOfVisitOther}
          disabled={loading}
          readOnly={readOnlyMode}
        />
      )}

      {/* ── Government ID — shown only for Vendor + Maintenance ── */}
      {isVendorMaintenance && !readOnlyMode && (
        <>
          <SelectField
            id="gov_id_type"
            label="Government ID Type"
            required
            register={register}
            error={errors.gov_id_type}
            options={GOV_ID_TYPES}
            disabled={loading}
            readOnly={false}
            value={govIdTypeValue}
          />
          <InputField
            id="gov_id_number"
            label={govIdTypeValue === "PAN" ? "PAN Number" : "Aadhar Number"}
            placeholder={
              govIdTypeValue === "PAN"
                ? "e.g. ABCDE1234F"
                : "Enter 12-digit Aadhar number"
            }
            required
            register={register}
            registerOptions={
              govIdTypeValue === "PAN"
                ? { setValueAs: (v) => (typeof v === "string" ? v.toUpperCase() : v) }
                : {}
            }
            error={errors.gov_id_number}
            disabled={loading}
            readOnly={false}
          />
        </>
      )}
      {isVendorMaintenance && readOnlyMode && (
        <>
          <InputField
            id="gov_id_type"
            label="Government ID Type"
            register={register}
            error={errors.gov_id_type}
            disabled={loading}
            readOnly
          />
          <InputField
            id="gov_id_number"
            label="Government ID Number"
            register={register}
            error={errors.gov_id_number}
            disabled={loading}
            readOnly
          />
        </>
      )}

      <SelectField
        id="entryGate"
        label="Entry Gate"
        required
        register={register}
        error={errors.entryGate}
        options={ENTRY_GATES}
        disabled={loading || readOnlyMode}
        readOnly={readOnlyMode}
        value={gateValue}
      />

      <SelectField
        id="department"
        label="Department"
        required
        register={register}
        error={errors.department}
        options={DEPARTMENTS}
        disabled={loading || readOnlyMode}
        readOnly={readOnlyMode}
        value={departmentValue}
      />

      <InputField
        id="vehicleNumber"
        label="Vehicle Number (If Applicable)"
        placeholder="e.g. DL-01-AB-1234"
        register={register}
        registerOptions={{
          setValueAs: (value) => (typeof value === "string" ? value.toUpperCase() : value),
        }}
        error={errors.vehicleNumber}
        disabled={loading}
        readOnly={readOnlyMode}
      />

      {/* ── Location ── */}
      {!readOnlyMode ? (
        <LocationPicker
          onChange={({ latitude, longitude }) => {
            setValue("latitude", latitude, { shouldValidate: true });
            setValue("longitude", longitude, { shouldValidate: true });
          }}
          error={errors.latitude || errors.longitude}
          disabled={loading}
        />
      ) : (
        <div className="field-group">
          <label className="field-label">Location</label>
          <input
            type="text"
            value={
              watch("latitude") && watch("longitude")
                ? `${Number(watch("latitude")).toFixed(6)}, ${Number(watch("longitude")).toFixed(6)}`
                : "N/A"
            }
            readOnly
            className="field-input readonly-input"
          />
        </div>
      )}

      <div className="date-time-row">
        <div>
          <label className="field-label" htmlFor="date">
            Date
          </label>
          <input
            id="date"
            type="text"
            value={dateValue || ""}
            readOnly
            className="field-input readonly-input"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="time">
            Time
          </label>
          <input
            id="time"
            type="text"
            value={timeValue || ""}
            readOnly
            className="field-input readonly-input"
          />
        </div>
      </div>

      <div className="action-row">
        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            CANCEL
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Please wait..." : submitLabel}
        </button>
      </div>
    </form>
  );
};
