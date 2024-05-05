import csv
from functools import reduce


STATS = {
    "cha": 4,
    "con": 14,
    "dex": 13,
    "int": 13,
    "str": 6,
    "wis": 12,
}


def int_if_number(v) -> int | str:
    if v.isnumeric():
        return int(v)
    return v


def calculate_distance_with_positive_overload(stats: dict) -> int:
    def __sum(acc, entry):
        if entry[0] == "result" or entry[0] == "":
            return acc
        return acc + entry[1] - STATS[entry[0]]

    return reduce(__sum, stats.items(), 0)


def calculate_distance_lacking(stats: dict) -> int:
    def __sum(acc, entry):
        if entry[0] == "result" or entry[0] == "":
            return acc
        return acc + max(0, entry[1] - STATS[entry[0]])

    return reduce(__sum, stats.items(), 0)


def calculate_distance_abs(stats: dict) -> int:
    def __sum(acc, entry):
        if entry[0] == "result" or entry[0] == "":
            return acc
        distance = entry[1] - STATS[entry[0]]
        if distance < 0:
            if entry[0] == "" and entry[1] == 4562:
                print(entry)
            return 9999
        return acc + distance

    return reduce(__sum, stats.items(), 0)


def get_dataset(path: str) -> list[dict[str, str]]:
    with open(path, "r", encoding="utf-8") as file:
        return [
            {k: int_if_number(v) for k, v in row.items()}
            for row in csv.DictReader(file, skipinitialspace=True)
        ]


dataset = get_dataset(r"../011 - Public Assets/d_and_d_sci.csv")

closest = min(dataset, key=calculate_distance_with_positive_overload)
print(
    "Function: calculate_distance_with_positive_overload\n",
    f"dataset: {closest}\n",
    f"score: {calculate_distance_with_positive_overload(closest)}",
)

closest_lacking = min(dataset, key=calculate_distance_lacking)
print(
    "Function: calculate_distance_only_lacking\n",
    f"dataset: {closest_lacking}\n",
    f"score: {calculate_distance_lacking(closest_lacking)}",
)

only_success = filter(lambda ds: ds["result"] == "succeed", dataset)
only_success = list(only_success)
closest_success_lacking = min(only_success, key=calculate_distance_lacking)
print(
    "Function: calculate_distance_only_lacking (only succeed)\n",
    f"dataset: {closest_success_lacking}\n",
    f"score: {calculate_distance_lacking(closest_success_lacking)}",
)

guaranteed_success = filter(lambda ds: calculate_distance_abs(ds) == 10, only_success)
assert len(list(guaranteed_success)) == 0

if __name__ == "__main__":
    potential_success = filter(
        lambda ds: 9 <= calculate_distance_abs(ds) <= 11, only_success
    )
    potential_success = list(potential_success)
    print(f"Potential success count: {len(potential_success)}")
    print(potential_success)
