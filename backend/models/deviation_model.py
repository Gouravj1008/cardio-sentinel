def check_deviation(current, baseline):
    if not baseline:
        return None

    mean = baseline["mean"]
    std = baseline["std"]

    if std == 0:
        return "stable"

    z_score = abs(current - mean) / std

    if z_score < 1:
        return "stable"
    elif z_score < 2:
        return "moderate deviation"
    else:
        return "significant deviation"
